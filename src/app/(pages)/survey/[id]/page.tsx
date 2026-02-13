"use client";
import React, { useEffect, useState } from "react";
import {
  dismissAlert,
  showError,
  showProgress,
  showSuccess,
} from "@/app/helpers/Alert";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import WorkSurveyBreadcrumb from "@/app/(pages)/survey/[id]/breadcrumb";
import { Options, Survey, UploaddedImage } from "@/types";
import WorkOrderStep from "@/app/(pages)/work_order/(special-form)/component/WorkOrderStep";
import WorkOrderStepMobile from "@/app/(pages)/work_order/(special-form)/component/WorkOrderStepMobile";
import { useAppSelector } from "@/app/redux/hook";
import { faFile, faMap, faPen } from "@fortawesome/free-solid-svg-icons";
import WorkOrderSurveyInfo from "@/app/(pages)/survey/components/WorkOrderSurveyInfo";
import SurveyCustomerInfo from "@/app/(pages)/survey/components/SurveyCustomerInfo";
import SurveyMeterInfo from "@/app/(pages)/survey/components/SurveyMeterInfo";
import handleSearchMainWorkCenter from "@/app/helpers/SearchMainWorkCenter";
import SurveyResult from "@/app/(pages)/survey/components/SurveyResult";
import SurveyHistory from "@/app/(pages)/survey/components/SurveyHistory";
import SurveyComment from "@/app/(pages)/survey/components/SurveyComment";
import { Button } from "@/components/ui/button";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import { Selection } from "@/app/components/form/Selection";
import InputTextArea from "@/app/components/form/InputTextArea";
import InputGroupCheckbox from "@/app/components/form/InputGroupCheckbox";
import { DESKTOP_SCREEN } from "@/app/redux/slices/ScreenSizeSlice";
import { useRouter, useSearchParams } from "next/navigation";
import handleSearchBusinessType from "@/app/helpers/SearchBusinessType";
import BusinessType from "../../work_order/(special-form)/component/work_execution/business_type";
import TransformerDateSelector from "../../work_order/(special-form)/s315/TransformerDateSelector";
import {
  getWorkOrderSurveyById,
  updateWorkOrderSurvey,
} from "@/app/api/WorkOrderSurveyApi";
import SurveyImages from "@/app/(pages)/survey/components/SurveyImages";
import SolarAirInfo from "@/app/(pages)/survey/components/special-form/s332-solar-air-condition/SolarAirInfo";
import SolarAirImages from "@/app/(pages)/survey/components/special-form/s332-solar-air-condition/SolarAirImages";
import { EndWorkPopup } from "@/components/ui/popup";
import { completeWorkByWorkOrderNo } from "@/app/api/WorkOrderApi";
import { ApiResponse } from "@/app/api/Api";
import SolarBatteryInfo from "@/app/(pages)/survey/components/special-form/s332-solar-battery/SolarBatteryInfo";
import SolarBatteryImages from "@/app/(pages)/survey/components/special-form/s332-solar-battery/SolarBatteryImages";
import _ from "lodash";
import SurveyHistoryS316 from "../../work_order/(special-form)/s316/SurveyHistoryS316";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { useOfflineSurveyForm } from "@/components/offline/OfflineSurveyForm";

const CreateUpdateWorkSurvey = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { setBreadcrumb } = useBreadcrumb();
  const { id } = React.use(params);
  const searchParams = useSearchParams();
  const isEdit = id !== "create";
  const [data, setData] = useState<Survey>({} as Survey);
  const screenSize = useAppSelector((state) => state.screen_size);
  const [currentStep, setCurrentStep] = useState(0);
  const [businessTypeOptions, setBusinessTypeOptions] = useState<Options[]>([]);
  const [showEndWorkPopup, setShowEndWorkPopup] = useState(false);
  const router = useRouter();
  const { saveSurvey, isSaving, isOnline } = useOfflineSurveyForm();

  const surveyStep = [
    { name: "ข้อมูลลูกค้า", icon: faPen },
    { name: "ข้อมูลใบคำร้อง", icon: faFile },
    { name: "ข้อมูลการสำรวจ", icon: faMap },
  ];

  useEffect(() => {
    showProgress();
    setBreadcrumb(
      <WorkSurveyBreadcrumb
        title={`${isEdit ? "แก้ไข" : "สร้าง"}ใบสั่งงาน งานสำรวจ`}
      />
    );

    Promise.all([
      fetchBusinessTypeOption(),
      isEdit && fetchWorkOrderSurveyDetail(),
    ]).then(() => {
      dismissAlert();
    });
  }, [setBreadcrumb]);

  const fetchBusinessTypeOption = async () => {
    const resBusinessType = await handleSearchBusinessType();
    setBusinessTypeOptions(resBusinessType || []);
  };

  const fetchWorkOrderSurveyDetail = async () => {
    const res = await getWorkOrderSurveyById(id);
    console.log("res >>>> ", res);
    if (res.status === 200 && res.data.data) {
      let items = res.data.data;

      if (items.surveyData?.images?.length > 0) {
        items.images = items.surveyData.images.map((item: UploaddedImage) =>
          parseInt(item.file_id)
        );
      }

      if (items.surveyData?.appointment_date) {
        items.surveyData.appointment_date = new Date(
          items.surveyData.appointment_date
        );
      }

      setData(items);
    }
  };

  const isCanEdit = () => {
    if (data && data.workOrderStatusCode) {
      return !["B", "J", "T", "X", "Y", "Z"].includes(data.workOrderStatusCode);
    }
    return true;
  };

  useEffect(() => {
    console.log("survey data >>>> ", data);
  }, [data]);

  const validateFields = () => {
    if (data.surveyData?.status !== "S") {
      if (!data.surveyData?.survey_by) {
        showError("กรูณาเลือกผู้ดำเนินการสำรวจ");
        return false;
      }

      if (!data.surveyData?.appointment_date) {
        showError("กรุณาเลือกวันที่นัดหมายสำรวจ");
        return false;
      }
    }

    return true;
  };

  const submit = async () => {
    let isValid = validateFields();
    if (!isValid) return;
    
    const survey = _.cloneDeep(data);
    if (survey.surveyData?.appointment_date) {
      survey.surveyData.appointment_date = new Date(
        survey.surveyData.appointment_date
      ).toISOString();
    }

    const result = await saveSurvey(id, survey);
    
    if (result.success) {
      window.location.href = `/survey/${id}`;
    }
  };

  const handleFinishWorkOrder = () => {
    setShowEndWorkPopup(true);
  };

  const handleConfirmFinishWorkOrder = async () => {
    setShowEndWorkPopup(false);
    showProgress();
    const res = await completeWorkByWorkOrderNo(data.workOrderNo);
    resSuccessOrError(res, "จบงานสำเร็จ");
  };

  const resSuccessOrError = (res: ApiResponse, message: string) => {
    if (res.status === 200) {
      if (res.data.error) {
        showError(res.data.message || "");
      } else {
        showSuccess(message).then((res) => {
          router.push("/work_order");
        });
      }
    }
  };

  const renderBusinessType = () => {
    return (
      <div className="border-1rounded-lg shadow-md">
        <CardCollapse title={"ประเภทธุรกิจ"}>
          <BusinessType
            data={data || ({} as Survey)}
            updateData={(d) => setData(d as unknown as Survey)}
            onUpdateOptions={setBusinessTypeOptions}
            businessOptions={businessTypeOptions}
            disabled={!isCanEdit()}
            isWorkOrderSurvey={true}
          />
        </CardCollapse>
      </div>
    );
  };

  const renderByService = () => {
    switch (data.requestCode.toLowerCase()) {
      case "s302":
      case "s303":
      case "s304":
      case "s306":
      case "s307":
        return renderBusinessType();
      case "s316":
        return (
          <div>
            <TransformerDateSelector
              data={data as any}
              updateData={(d) => setData(d as unknown as Survey)}
              disabled={!isCanEdit()}
            />

            <SurveyHistoryS316
              data={data as any}
              updateData={(d) => setData(d as unknown as Survey)}
            />
          </div>
        );
      case "s332_solar_air_conditioner":
        return (
          <div>
            <SolarAirInfo data={data} updateData={setData} />

            <SolarAirImages data={data} updateData={setData} />
          </div>
        );
      case "s332_solar_battery":
        return (
          <div>
            <SolarBatteryInfo data={data} updateData={setData} />

            <SolarBatteryImages data={data} updateData={setData} />
          </div>
        );
    }
  };

  return (
    <div>
      <WorkOrderSurveyInfo data={data} updateData={setData} />

      {screenSize === DESKTOP_SCREEN ? (
        <WorkOrderStep
          steps={surveyStep}
          currentStep={currentStep}
          updateStep={setCurrentStep}
        />
      ) : (
        <WorkOrderStepMobile
          steps={surveyStep}
          currentStep={currentStep}
          updateStep={setCurrentStep}
        />
      )}

      {currentStep === 0 && (
        <div>
          <SurveyCustomerInfo data={data} updateData={setData} />

          {/*<SurveyMeterInfo
            data={data}
            updateData={setData}
            mainWorkCenterOptions={mainWorkCenterOptions}
            onUpdateOptions={setMainWorkCenterOptions}
          />*/}
        </div>
      )}

      {currentStep === 1 && (
        <div>
          <CardCollapse
            title={"สร้างแบบคำร้องขอติดตั้งระบบผลิตไฟฟ้าจากพลังงานแสงอาทิตย์"}
          >
            <div className="mb-3 text-[#6B7280] -mt-2">
              บริการที่ต้องการขอใช้
            </div>
            <CustomTooltip
              fieldValue={data.serviceName}
              fieldLabel="บริการที่ต้องการขอใช้"
            >
              <Selection
                value={data.serviceId}
                options={[
                  { value: data.serviceId, label: data.serviceName },
                ]}
                placeholder={"บริการที่ต้องการขอใช้"}
                disabled={true}
              />
            </CustomTooltip>
          </CardCollapse>

          <CardCollapse title={"ข้อมูลจากการสำรวจ"}>
            <div className="-mt-8 mb-3">
              <InputGroupCheckbox
                options={[
                  { label: "ช่วงเช้า (9.00 - 12.00)", value: "morning_flag" },
                  {
                    label: "ช่วงบ่าย (13.00 - 16.00)",
                    value: "afternoon_flag",
                  },
                ]}
                showSelected={false}
                searchable={false}
                setData={() => {}}
                selectedValue={
                  [
                    data?.requestData?.morning_flag && "morning_flag",
                    data?.requestData?.afternoon_flag && "afternoon_flag",
                  ].filter(Boolean) as string[]
                }
                disabled={true}
              />
            </div>

            <CustomTooltip
              fieldValue={data?.requestData?.detail}
              fieldLabel="รายละเอียดเพิ่มเติม"
              variant="textarea"
            >
              <InputTextArea
                data={data?.requestData?.detail}
                label="รายละเอียดเพิ่มเติม"
                onChange={() => {}}
                isReadOnly={true}
              />
            </CustomTooltip>
          </CardCollapse>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <SurveyResult data={data} updateData={setData} />

          {renderByService()}

          <SurveyHistory id={id} />

          <SurveyImages data={data} updateData={setData} surveyId={id} />

          <SurveyComment data={data} updateData={setData} />
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-3">
        <div className="w-full md:w-auto gap-2 md:mb-0">
          <Button className="rounded-full text-[#A6A6A6] border-[#A6A6A6] border-1 w-full hover:text-[#A6A6A6] py-2 px-3 bg-[white] hover:bg-[white] cursor-pointer">
            ย้อนกลับ
          </Button>
        </div>

        <div className="md:w-auto w-full flex flex-wrap justify-end gap-3">
          <Button
            className="rounded-full bg-[white] border-[#671FAB] border-1 !text-[#671FAB] !hover:text-[#671FAB] py-2 px-3 w-full md:w-auto cursor-pointer hover:bg-[white]"
            onClick={() => submit()}
            disabled={isSaving}
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>

          {currentStep < surveyStep.length - 1 && (
            <Button
              className="rounded-full bg-[#671FAB] hover:bg-[#671FAB] border-[#671FAB] border-1 !text-[white] !hover:text-[white] py-2 px-3 w-full md:w-auto cursor-pointer"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              ถัดไป
            </Button>
          )}

          {currentStep === surveyStep.length - 1 && (
            <Button
              className="rounded-full bg-[#671FAB] hover:bg-[#671FAB] border-[#671FAB] border-1 !text-[white] !hover:text-[white] py-2 px-3 w-full md:w-auto cursor-pointer"
              onClick={() => handleFinishWorkOrder()}
            >
              จบงาน
            </Button>
          )}
        </div>
      </div>

      <EndWorkPopup
        open={showEndWorkPopup}
        onClose={() => setShowEndWorkPopup(false)}
        onConfirm={handleConfirmFinishWorkOrder}
      />
    </div>
  );
};

export default CreateUpdateWorkSurvey;
