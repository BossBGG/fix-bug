import Modal from "@/app/layout/Modal";
import {Button} from "@/components/ui/button";
import React, {useEffect, useState} from "react";
import InputText from "@/app/components/form/InputText";
import {Assignee, MainWorkCenter, Options, Event, WorkerOptionObj} from "@/types";
import {Label} from "@/components/ui/label";
import {RequiredLabel} from "@/app/helpers/RequiredFieldHelper";
import {Selection} from "@/app/components/form/Selection";
import handleSearchMainWorkCenter from "@/app/helpers/SearchMainWorkCenter";
import handleSearchEvent from "@/app/helpers/SearchEvent";
import {groupWorkerOptions} from "@/app/api/WorkOrderApi";
import {getWorkerListOptions, getVendorWorkerOptions} from "@/app/helpers/WorkerOptions";
import {showError} from "@/app/helpers/Alert";
import InputDateTimePicker from "@/app/components/form/InputDateTimePicker";
import { validateDateTimeRange } from "@/app/helpers/DateValidation";

interface AddWorkerProps {
  open: boolean,
  onClose: () => void,
  onAddWorker: (worker: Assignee) => void,
  onUpdateWorker: (worker: Assignee) => void,
  workerOptions: Options[],
  eventOptions: Options[],
  workCenterOptions: Options[],
  onUpdateWorkerOptions: (d: Options[]) => void,
  onUpdateEventOptions: (d: Options[]) => void,
  onUpdateWorkCenterOptions: (d: Options[]) => void,
  editData: Assignee | null
}

const AddWorker = ({
                    open,
                    onClose,
                    onAddWorker,
                    workerOptions,
                    eventOptions,
                     workCenterOptions,
                     onUpdateWorkerOptions,
                     onUpdateEventOptions,
                     onUpdateWorkCenterOptions,
                     editData,
                     onUpdateWorker
                  }: AddWorkerProps) => {


  const [formData, setFormData] = useState<Assignee>({} as Assignee);

  useEffect(() => {
    if(editData) {
      setFormData(editData)
    }
  }, [editData])

  const handleDateChange = (key: "startDatetime" | "endDatetime", value: Date | undefined) => {
    const startDate = key === "startDatetime" ? value : formData.startDatetime;
    const endDate = key === "endDatetime" ? value : formData.endDatetime;

    if (!validateDateTimeRange(startDate, endDate)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleInputChange = async (key: keyof Assignee, value: string | number, item?: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
      workUnit: key === 'userType'
        ? value === 'peaUser'
          ? 'H' : 'Z05'
        : prev.workUnit,
      workCenterId: key === 'userType' ? '' : prev.workCenterId,
      // Clear username เมื่อเปลี่ยนกลุ่มผู้ปฏิบัติงาน
      username: key === 'userType' ? '' : prev.username,
    }));

    if(key === 'userType') {
      const type = value === 'peaUser' ? 'pea' : 'vendor';

      // Fetch work center options สำหรับ type ใหม่ และ tag ด้วย _sourceType
      const newWcOptions = await handleSearchMainWorkCenter('', type);
      const taggedWcOptions = newWcOptions.map(o => ({
        ...o,
        data: { ...o.data, _sourceType: type }
      }));

      console.log(`[AddWorker handleInputChange] type=${type}, fetched=${taggedWcOptions.length} wc options`);

      // Re-tag: untagged ที่ตรงกับ fetched → ใส่ tag ใหม่
      const newWcValueSet = new Set(taggedWcOptions.map(o => o.value));
      const updatedExisting = workCenterOptions.map(existing => {
        if (newWcValueSet.has(existing.value) && !existing.data?._sourceType) {
          const tagged = taggedWcOptions.find(t => t.value === existing.value);
          return tagged || existing;
        }
        return existing;
      });
      const existingWcValues = new Set(workCenterOptions.map(o => o.value));
      const trulyNewWc = taggedWcOptions.filter(o => !existingWcValues.has(o.value));
      const finalWcOptions = [...updatedExisting, ...trulyNewWc];

      console.log(`[AddWorker handleInputChange] final wc: total=${finalWcOptions.length}, pea=${finalWcOptions.filter(o => o.data?._sourceType === 'pea').length}, vendor=${finalWcOptions.filter(o => o.data?._sourceType === 'vendor').length}, untagged=${finalWcOptions.filter(o => !o.data?._sourceType).length}`);
      onUpdateWorkCenterOptions(finalWcOptions);

      // Fetch worker options สำหรับ type ใหม่
      const searchWorkerFn = value === 'vendorUser' ? getVendorWorkerOptions : getWorkerListOptions;
      const newWorkerOpts = await searchWorkerFn('');
      const existingWorkerValues = new Set(workerOptions.map(o => o.value));
      const uniqueNewWorkers = newWorkerOpts.filter(o => !existingWorkerValues.has(o.value));
      onUpdateWorkerOptions([...workerOptions, ...uniqueNewWorkers]);
    }

    if(item) {
      switch (key) {
        case "workCenterId":
          let inOptionWorkCenter = workCenterOptions.find((opt) => opt.value === value)
          if(!inOptionWorkCenter) {
            workCenterOptions.push({value: value, label: item.Ktext, data: item});
            onUpdateWorkCenterOptions(workCenterOptions);
          }
          break;
        case "workActivityTypeId":
          let inOption = eventOptions.find((opt) => opt.value === value)
          if(!inOption) {
            eventOptions.push({value: value, label: item.ktext, data: item});
            onUpdateEventOptions(eventOptions)
          }
          break;
        case "username":
          let inOptionWorker = workerOptions.find((opt) => opt.value === value)
          if(!inOptionWorker) {
            // Vendor: data มี vendorData → ใช้ username + employeeName
            // PEA: data มี firstName/lastName
            const label = item?.vendorData
              ? `${item.username} - ${item.employeeName || ''}`
              : `${item.username} - ${item.firstName} ${item.lastName}`;
            workerOptions.push({value: value, label, data: item});
            onUpdateWorkerOptions(workerOptions)
          }
          break;
        default:
          break;
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.userType
      || !formData.username
      || !formData.workCenterId
      || !formData.workActivityTypeId
      || !formData.workHours
    ) {
      showError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if(editData) {
      onUpdateWorker(formData)
    }else {
      const newWorker: Assignee = {
        ...formData,
        isUpdate: false,
        isEdited: false
      } as Assignee;

      onAddWorker?.(newWorker);
    }

    // Reset form
    setFormData({} as Assignee);
    onClose();
  };

  const handleCancel = () => {
    setFormData({} as Assignee);
    onClose();
  };

  const getDateValue = (dateValue: Date | string | undefined): Date | undefined => {
    if (!dateValue) return undefined;
    if (dateValue instanceof Date) return dateValue;
    return new Date(dateValue);
  };


  return (
    <Modal title="เพิ่มผู้ปฏิบัติงาน"
           footer={
             <div className="w-full flex flex-wrap justify-between items-center">
               <div className="p-2 w-1/2">
                 <Button
                   className="text-[#671FAB] w-full bg-white border-1 border-[#671FAB] rounded-full font-semibold md:text-start text-center cursor-pointer hover:bg-white"
                   onClick={handleCancel}
                 >
                   ยกเลิก
                 </Button>
               </div>
               <div className="p-2 w-1/2">
                 <Button className="pea-button w-full" onClick={handleSubmit}>
                   บันทึก
                 </Button>
               </div>
             </div>
           }
           open={open}
           onClose={onClose}>

      <div className="space-y-4">
        {/* กลุ่มผู้ปฏิบัติงาน */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            <RequiredLabel required={true}>กลุ่มผู้ปฏิบัติงาน</RequiredLabel>
          </Label>
          <Selection
            options={groupWorkerOptions}
            value={formData.userType || ''}
            placeholder="เลือกกลุ่มผู้ปฏิบัติงาน"
            onUpdate={(value: string | number) => handleInputChange('userType', value)}
          />

        </div>

        {/* ผู้ปฏิบัติงาน */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            <RequiredLabel required={true}>ผู้ปฏิบัติงาน</RequiredLabel>
          </Label>
          <Selection value={formData.username || ''}
                     options={
                       formData.userType === 'vendorUser'
                         ? workerOptions.filter(o => o.data?.workcenterCode)
                         : workerOptions.filter(o => !o.data?.workcenterCode)
                     }
                     placeholder={"ผู้ปฏิบัติงาน"}
                     onUpdate={(value, item: WorkerOptionObj) => handleInputChange('username', value, item)}
                     onSearch={(s: string) => {
                       return formData.userType === 'vendorUser'
                         ? getVendorWorkerOptions(s)
                         : getWorkerListOptions(s);
                     }}
          />
        </div>

        {/* ศูนย์งานหลัก */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            <RequiredLabel required={true}>ศูนย์งานหลัก</RequiredLabel>
          </Label>
          <Selection value={formData.workCenterId || ''}
                     options={
                       (() => {
                         // vendor เห็นเฉพาะ tagged vendor, PEA เห็น tagged pea + untagged
                         return formData.userType === 'vendorUser'
                           ? workCenterOptions.filter(o => o.data?._sourceType === 'vendor')
                           : workCenterOptions.filter(o => !o.data?._sourceType || o.data._sourceType === 'pea');
                       })()
                     }
                     placeholder={"ระบุศูนย์งานหลัก"}
                     onUpdate={(value, item: MainWorkCenter) => handleInputChange('workCenterId', value, item)}
                     onSearch={(s: string) => {
                       const type = formData.userType === 'peaUser' ? 'pea' : formData.userType === 'vendorUser' ? 'vendor' : undefined;
                       return handleSearchMainWorkCenter(s, type);
                     }}
          />
        </div>

        {/* กิจกรรม */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            <RequiredLabel required={true}>กิจกรรม</RequiredLabel>
          </Label>
          <Selection value={formData.workActivityTypeId || ''}
                     options={eventOptions}
                     placeholder={"เลือกกิจกรรม"}
                     onUpdate={(value, item: Event) => handleInputChange('workActivityTypeId', value, item)}
                     onSearch={(s: string) => handleSearchEvent(s)}
          />
        </div>

        {/* ชั่วโมง/งาน */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            <RequiredLabel required={true}>ชั่วโมง/งาน</RequiredLabel>
          </Label>
          <InputText
            value={formData.workHours ? formData.workHours.toString() : ''}
            placeholder="ระบุชั่วโมง/งาน"
            onChange={(value: string) => handleInputChange('workHours', parseInt(value))}
            numberOnly={true}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            วันที่และเวลาเริ่มต้น
          </Label>
          <InputDateTimePicker value={getDateValue(formData.startDatetime)}
                               onChange={(v) => handleDateChange("startDatetime", v)}
                               placeholder={"วันที่และเวลาเริ่มต้น"}
                               showConfirmButton={true}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            วันที่และเวลาสิ้นสุด
          </Label>
          <InputDateTimePicker value={getDateValue(formData.endDatetime)}
                               onChange={(v) => handleDateChange("endDatetime", v)}
                               placeholder={"วันที่และเวลาสิ้นสุด"}
                               showConfirmButton={true}
          />
        </div>

        {/* หน่วย */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            หน่วย
          </Label>
          <div>{formData.workUnit || ''}</div>
        </div>
      </div>
    </Modal>
  )
}

export default AddWorker;
