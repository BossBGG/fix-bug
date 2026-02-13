import InputText from "@/app/components/form/InputText";
import {Options, WorkOrderObj} from "@/types";
import InputSelect from "@/app/components/form/InputSelect";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import {useAppSelector} from "@/app/redux/hook";
import {JobPriorityOptions} from "@/app/api/WorkOrderApi";
import {useEffect, useState} from "react";
import {Selection} from "@/app/components/form/Selection";
import handleSearchMainWorkCenter from "@/app/helpers/SearchMainWorkCenter";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";
import {getWorkOrderStatusLabel} from "@/app/helpers/map-work-order-status";
import {CustomTooltip} from "@/components/ui/custom-tooltip";
import handleSearchActivityPM from "@/app/helpers/SearchActivityPM";

interface WorkOrderInfoProps {
  data: WorkOrderObj;
  updateData: (d: WorkOrderObj) => void;
  mainWorkCenterOptions: Options[];
  activityPMOptions: Options[];
  onUpdateOptions: (d: Options[]) => void;
  onUpdateActivityPMOptions: (d: Options[]) => void;
  disabled?: boolean;
}

const WorkOrderInfo = ({
                         data,
                         updateData,
                         mainWorkCenterOptions,
                         activityPMOptions,
                         onUpdateOptions,
                         onUpdateActivityPMOptions,
                         disabled,
                       }: WorkOrderInfoProps) => {
  const screenSize = useAppSelector((state) => state.screen_size);
  const [isDisable, setIsDisable] = useState(true);

  useEffect(() => {
    if (["W", "M"].includes(data.workOrderStatusCode)) {
      setIsDisable(false);
    }
  }, [data.workOrderStatusCode]);

  const handleUpdateData = (
    key: keyof WorkOrderObj,
    value: string | number
  ) => {
    let newData = {
      ...data,
      [key]: value,
    };

    updateData(newData);
  };

  return (
    <CardCollapse
      title={"รายละเอียดคำร้อง"}
      isShowHeader={screenSize !== DESKTOP_SCREEN}
    >
      <div className="flex flex-wrap items-center">
        <div className="w-full md:w-1/5 p-2">
          <CustomTooltip
            fieldValue={data.workOrderNo}
            fieldLabel="เลขที่ใบสั่งงาน"
          >
            <InputText
              placeholder="เลขที่ใบสั่งงาน"
              label="เลขที่ใบสั่งงาน"
              value={data.workOrderNo}
              numberOnly={true}
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/5 p-2">
          <CustomTooltip
            fieldValue={data.customerRequestNo as string}
            fieldLabel="เลขที่คำร้อง"
          >
            <InputText
              placeholder="เลขที่คำร้อง"
              label="เลขที่คำร้อง"
              value={data.customerRequestNo as string}
              numberOnly={true}
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/5 p-2">
          <CustomTooltip
            fieldValue={data.sapOrderNo}
            fieldLabel="เลขที่คำร้อง (SAP)"
          >
            <InputText
              placeholder="เลขที่คำร้อง (SAP)"
              label="เลขที่คำร้อง (SAP)"
              value={data.sapOrderNo}
              numberOnly={true}
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/5 p-2">
          <CustomTooltip
            fieldValue={data.serviceName}
            fieldLabel="ประเภทคำร้อง"
          >
            <InputText
              placeholder="ประเภทคำร้อง"
              label="ประเภทคำร้อง"
              value={data.serviceName}
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/5 p-2">
          <CustomTooltip
            fieldValue={getWorkOrderStatusLabel(data.workOrderStatusCode)}
            fieldLabel="สถานะคำร้อง"
          >
            <InputText
              placeholder="สถานะคำร้อง"
              value={getWorkOrderStatusLabel(data.workOrderStatusCode)}
              label="สถานะคำร้อง"
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/5 p-2">
          <CustomTooltip
            fieldValue={
              JobPriorityOptions.find(
                (opt) => opt.value === data.priority?.toString()
              )?.label
            }
            fieldLabel="ลำดับความสำคัญของงาน"
          >
            <InputSelect
              options={JobPriorityOptions}
              value={data.priority?.toString() || ""}
              placeholder="ลำดับความสำคัญของงาน"
              label="ลำดับความสำคัญของงาน"
              setData={(v) =>
                handleUpdateData("priority", parseInt(v as string))
              }
              disabled={isDisable || disabled}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/5 p-2">
          <CustomTooltip
            fieldValue={
              data.sapProcessCreatedDate
                ? formatJSDateTH(
                  new Date(data.sapProcessCreatedDate),
                  "dd MMMM yyyy"
                )
                : ""
            }
            fieldLabel="วันที่รับชำระเงิน"
          >
            <InputText
              placeholder="วันที่รับชำระเงิน"
              value={
                data.sapProcessCreatedDate
                  ? formatJSDateTH(
                    new Date(data.sapProcessCreatedDate),
                    "dd MMMM yyyy"
                  )
                  : ""
              }
              disabled={true}
              label="วันที่รับชำระเงิน"
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/5 p-2">
          <CustomTooltip
            fieldValue={
              activityPMOptions.find((opt) => opt.value === data.activityPmId)
                ?.label
            }
            fieldLabel="กิจกรรม PM"
          >
            <div>
              <div className="mb-3">กิจกรรม PM</div>
              <Selection
                options={activityPMOptions}
                value={data.activityPmId}
                placeholder="กิจกรรม PM"
                onUpdate={(v) => handleUpdateData("activityPmId", v)}
                disabled={isDisable || disabled}
                onSearch={handleSearchActivityPM}
                onUpdateOptions={onUpdateActivityPMOptions}
              />
            </div>
          </CustomTooltip>
        </div>

        <div className="w-full md:w-2/5 p-2">
          <CustomTooltip
            fieldValue={data.workDescription}
            fieldLabel="คำอธิบายการทำงาน"
          >
            <InputText
              placeholder="คำอธิบายการทำงาน"
              value={data.workDescription}
              label="คำอธิบายการทำงาน"
              onChange={(v) => handleUpdateData("workDescription", v)}
              disabled={isDisable || disabled}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/4 p-2">
          <CustomTooltip fieldValue={data.peaNameFull} fieldLabel="กอง/กฟฟ.">
            <InputText
              placeholder="กอง/กฟฟ."
              value={data.peaNameFull}
              label="กอง/กฟฟ."
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/4 p-2">
          <CustomTooltip fieldValue={data.officePlant} fieldLabel="รหัสโรงงาน">
            <InputText
              placeholder="รหัสโรงงาน"
              value={data.officePlant}
              label="รหัสโรงงาน"
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/4 p-2">
          <CustomTooltip
            fieldValue={
              mainWorkCenterOptions.find(
                (opt) => opt.value === data.mainWorkCenterId
              )?.label
            }
            fieldLabel="ศูนย์งาน"
          >
            <div className="mb-3">
              ศูนย์งาน
              <span className="text-[red] ml-1">*</span>
            </div>
            <Selection
              options={mainWorkCenterOptions}
              value={data.mainWorkCenterId}
              placeholder="ศูนย์งาน"
              onSearch={(s: string) => handleSearchMainWorkCenter(s)}
              onUpdateOptions={onUpdateOptions}
              onUpdate={(v) => handleUpdateData("mainWorkCenterId", v)}
              disabled={isDisable || disabled}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/4 p-2">
          <CustomTooltip fieldValue={data.costCenter} fieldLabel="ศูนย์ต้นทุน">
            <InputText
              placeholder="ศูนย์ต้นทุน"
              value={data.costCenter}
              label="ศูนย์ต้นทุน"
              disabled={true}
            />
          </CustomTooltip>
        </div>
      </div>
    </CardCollapse>
  );
};

export default WorkOrderInfo;
