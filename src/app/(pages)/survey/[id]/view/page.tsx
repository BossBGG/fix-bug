"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import {
  completeWorkByWorkOrderNo,
  updateWorkOrderStatus,
} from "@/app/api/WorkOrderApi";
import {
  Options,
  ResolvedData,
  S301ServiceData,
  S316ServiceData,
  S318ServiceData,
  Survey,
  WorkOrderObj,
} from "@/types";
import WorkOrderDetailBreadcrumb from "@/app/(pages)/work_order/[id]/breadcrumb";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faPrint } from "@fortawesome/free-solid-svg-icons";
import LatestUpdateData from "@/app/components/utils/LatestUpdateData";
import WorkOrderInfo from "@/app/(pages)/work_order/(special-form)/component/workorder-details/WorkOrderInfo";
import { renderStatusWorkOrder } from "@/app/(pages)/work_order/[id]/work-order-status";
import CustomerAndWorkerInfo from "@/app/(pages)/work_order/(special-form)/component/workorder-details/CustomerAndWorkerInfo";
import handleSearchEvent from "@/app/helpers/SearchEvent";
import handleSearchMainWorkCenter from "@/app/helpers/SearchMainWorkCenter";
import { getWorkerListOptions } from "@/app/helpers/WorkerOptions";
import MaterialEquipmentChecklistPage from "@/app/(pages)/work_order/(special-form)/component/material_equipment_checklist/material_equipment_checklist";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import {
  handleSearchTransformerBrands,
  handleSearchTransformerPhase,
  handleSearchTransformerSize,
  handleSearchTransformerType,
  handleSearchTransformerVoltage,
} from "@/app/helpers/SearchTransformer.";
import {
  handleSearchRenewableSource,
  handleSearchRenewableType,
} from "@/app/helpers/SearchRenewable";
import { handleSearchRequestService } from "@/app/helpers/SearchRequestService";
import { handleSearchServiceType } from "@/app/helpers/SearchServiceType";
import BusinessType from "@/app/(pages)/work_order/(special-form)/component/work_execution/business_type";
import TransformerList from "@/app/(pages)/work_order/(special-form)/s305/transformer-list";
import { ModalConfirm } from "@/app/components/utils/ModalConfirm";
import PopupStartWork from "@/assets/images/popup_startwork.png";
import {
  dismissAlert,
  showConfirm,
  showError,
  showProgress,
  showSuccess,
} from "@/app/helpers/Alert";
import ModalReferenceData from "@/app/(pages)/work_order/[id]/modal-reference-data";
import { ModalRelationWorkOrder } from "@/app/(pages)/work_order/[id]/modal-relation-work-order";
import HistoryModal from "@/app/(pages)/work_order/[id]/HistoryModal";
import { formatJSDate } from "@/app/helpers/DatetimeHelper";
import { ApiResponse } from "@/app/api/Api";
import { Selection } from "@/app/components/form/Selection";
import InputTextArea from "@/app/components/form/InputTextArea";
import InputGroupCheckbox from "@/app/components/form/InputGroupCheckbox";
import { getWorkOrderSurveyById } from "@/app/api/WorkOrderSurveyApi";
import { EndWorkPopup } from "@/components/ui/popup";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

const WorkOrderDetailSurvey = () => {
  const params = useParams();
  const [data, setData] = useState<Survey>({} as Survey);
  const id = params.id as string;
  const router = useRouter();
  const { setBreadcrumb } = useBreadcrumb();
  const [eventOptions, setEventOptions] = useState<Options[]>([]);
  const [mainWorkCenterOptions, setMainWorkCenterOptions] = useState<Options[]>(
    []
  );
  const [serviceEquipmentOptions, setServiceEquipmentOptions] = useState<
    Options[]
  >([]);
  const [businessTypeOptions, setBusinessTypeOptions] = useState<Options[]>([]);
  const [voltagesOptions, setVoltagesOptions] = useState<Options[]>([]);
  const [renewableSourceOptions, setRenewableSourceOptions] = useState<
    Options[]
  >([]);
  const [renewableTypeOptions, setRenewableTypeOptions] = useState<Options[]>(
    []
  );
  const [workerOptions, setWorkerOptions] = useState<Options[]>([]);
  const [transformerBrandOptions, setTransformerBrandOptions] = useState<
    Options[]
  >([]);
  const [transformerPhaseOptions, setTransformerPhaseOptions] = useState<
    Options[]
  >([]);
  const [transformerTypeOptions, setTransformerTypeOptions] = useState<
    Options[]
  >([]);
  const [transformerSizeOptions, setTransformerSizeOptions] = useState<
    Options[]
  >([]);
  const [requestServiceOptions, setRequestServiceOptions] = useState<Options[]>(
    []
  );
  const [serviceTypesOptions, setServiceTypesOptions] = useState<Options[]>([]);
  const [requestCode, setRequestCode] = useState<string>("");
  const [isShowConfirmStart, setIsShowConfirmStart] = useState(false);
  const [meterEquipmentOptions, setMeterEquipmentOptions] = useState<Options[]>(
    []
  );
  const defaultClassMenuItem =
    "p-3 cursor-pointer mb-3 flex justify-center items-center";
  // const workOrderRef = useRef<HTMLDivElement>(null);
  const [refType, setRefType] = useState<
    "ref_service_req" | "ref_work_order" | null
  >(null);
  const [showWorkOrderRelation, setShowWorkOrderRelation] =
    useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showEndWorkPopup, setShowEndWorkPopup] = useState(false);

  useEffect(() => {
    setBreadcrumb(<WorkOrderDetailBreadcrumb path={id} title={"ใบสั่งงาน"} />);
    showProgress();
    getWorkOrderSurveyById(id).then(async (res) => {
      if (res.status === 200) {
        let items = res.data.data as Survey;
        setData(items);
      }
      dismissAlert();
    });
  }, []);

  const handleEdit = () => {
    router.push(`/survey/${id}`);
  };

  const handleFinishWorkOrder = () => {
    setShowEndWorkPopup(true);
  };

  const handleConfirmFinishWorkOrder = async () => {
    setShowEndWorkPopup(false);
    showProgress();
    const res = await completeWorkByWorkOrderNo(data.workOrderNo);
    if (res.status === 200) {
      if (res.data.error) {
        showError(res.data.message || "");
      } else {
        showSuccess("จบงานสำเร็จ").then((res) => {
          router.push("/work_order");
        });
      }
    }
  };

  const submitConfirmStart = async () => {
    showProgress();
    const res = await updateWorkOrderStatus(id, "O");
    if (res.status === 200) {
      dismissAlert();
      router.push("/work_order");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center items-center md:justify-between">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div>
            <h1 className="text-[24px] font-bold text-[#671FAB]">
              {data.customerRequestNo}
            </h1>
            <LatestUpdateData showConnectInfo={false} />
          </div>

          <Button
            className="bg-[#E1D2FF] hover:bg-[#E1D2FF] rounded-full justify-center items-center h-[44px] w-[44px] p-0 cursor-pointer md:hidden"
            variant="outline"
            onClick={() => setShowHistory(true)}
          >
            <FontAwesomeIcon icon={faClock} color={"#671FAB"} size={"lg"} />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-5 w-full md:w-auto">
          <Button
            className="pea-button h-[44px]"
            variant="outline"
            onClick={() => {
              setShowWorkOrderRelation(true);
            }}
          >
            แสดงความสัมพันธ์ใบสั่งงาน
          </Button>

          <Button
            className="bg-[#E1D2FF] hover:bg-[#E1D2FF] rounded-full justify-center items-center h-[44px] w-[44px] p-0 cursor-pointer hidden md:flex"
            variant="outline"
            onClick={() => setShowHistory(true)}
          >
            <FontAwesomeIcon icon={faClock} color={"#671FAB"} size={"lg"} />
          </Button>
        </div>
      </div>

      <div className="w-full">
        {/* Work Order Detail */}
        <WorkOrderInfo
          data={data as unknown as WorkOrderObj}
          status={renderStatusWorkOrder(data.workOrderStatusCode)}
        />

        {/* ข้อมูลลูกค้า รายชื่อผู้ปฏิบัติงาน แผนที่ / พิกัด */}
        <CustomerAndWorkerInfo
          data={data as unknown as WorkOrderObj}
          eventOptions={eventOptions}
          workCenterOptions={mainWorkCenterOptions}
          workerOptions={workerOptions}
          isWorkOrderSurvey={true}
        />

        <CardCollapse title={"ข้อมูลใบคำร้อง"}>
          <div className="flex flex-col">
            <div className="p-4 border-1 mb-4 rounded-lg shadow-md">
              <div className="mb-2">
                สร้างแบบคำร้องขอติดตั้งระบบผลิตไฟฟ้าจากพลังงานแสงอาทิตย์
              </div>
              <div className="mb-3 text-[#6B7280]">บริการที่ต้องการขอใช้</div>
              <CustomTooltip
                fieldValue={data.serviceId}
                fieldLabel="บริการที่ต้องการขอใช้"
              >
                <Selection
                  value={data.serviceId}
                  options={[{ value: data.serviceId, label: data.serviceName }]}
                  placeholder={"บริการที่ต้องการขอใช้"}
                  disabled={true}
                />
              </CustomTooltip>
            </div>

            <div className="p-4 border-1 mb-4 rounded-lg shadow-md">
              <div className="mt-4 mb-3">
                <div className="mb-2 font-medium">
                  ช่วงเวลาที่สะดวกให้ติดต่อกลับ
                </div>
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
                fieldValue={data.surveyData?.result_note}
                fieldLabel="รายละเอียดเพิ่มเติม"
                variant="textarea"
              >
                <InputTextArea
                  data={data.surveyData?.result_note}
                  label="รายละเอียดเพิ่มเติม"
                  onChange={() => {}}
                  isReadOnly={true}
                />
              </CustomTooltip>
            </div>
          </div>
        </CardCollapse>
      </div>

      <div className="flex flex-wrap justify-between items-center">
        <div className="w-full md:w-auto">
          <Button
            className="rounded-full text-[#A6A6A6] border-1 border-[#A6A6A6] bg-white hover:bg-white cursor-pointer w-full md:w-auto"
            onClick={() => router.push("/work_order")}
          >
            ยกเลิก
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto md:mt-0 mt-3">
          <div className="w-full md:w-auto">
            <Button className="rounded-full text-[#671FAB] bg-white border-1 hover:bg-white border-[#671FAB] cursor-pointer w-full md:w-auto">
              <FontAwesomeIcon icon={faPrint} className="mr-2" />
              พิมพ์เอกสาร
            </Button>
          </div>

          {!["B", "J", "T", "X", "Y", "Z"].includes(
            data.workOrderStatusCode
          ) && (
            <div className="w-full md:w-auto">
              <Button
                className="rounded-full text-[#671FAB] bg-white cursor-pointer hover:bg-white border-1 border-[#671FAB] w-full md:w-auto"
                onClick={() => handleEdit()}
              >
                แก้ไข
              </Button>
            </div>
          )}

          <div className="w-full md:w-auto">
            <Button
              className="rounded-full text-white bg-[#671FAB] hover:bg-[#671FAB] cursor-pointer w-full md:w-auto"
              onClick={() => handleFinishWorkOrder()}
            >
              สรุปจบใบสั่งงาน
            </Button>
          </div>
        </div>
      </div>

      <ModalConfirm
        open={isShowConfirmStart}
        onCancel={() => setIsShowConfirmStart(false)}
        onSubmit={submitConfirmStart}
        confirmText="เริ่มปฏิบัติงาน"
        title="เริ่มปฏิบัติงาน?"
        message="ท่านต้องการเริ่มปฏิบัติงาน ‘ใช่ หรือ ไม่’ "
        icon={
          <div className="relative">
            <img
              src={PopupStartWork.src}
              alt="start work image"
              className="w-[120px] h-[110px]"
            />
          </div>
        }
      />

      <ModalReferenceData
        open={refType !== null}
        onClose={() => setRefType(null)}
        workOrderType={refType}
        id={id}
      />

      <ModalRelationWorkOrder
        open={showWorkOrderRelation}
        onClose={() => setShowWorkOrderRelation(false)}
        id={id}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        id={id}
      />

      <EndWorkPopup
        open={showEndWorkPopup}
        onClose={() => setShowEndWorkPopup(false)}
        onConfirm={handleConfirmFinishWorkOrder}
      />
    </div>
  );
};

export default WorkOrderDetailSurvey;
