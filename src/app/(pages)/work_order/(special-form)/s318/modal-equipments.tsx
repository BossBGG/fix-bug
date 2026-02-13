import Modal from "@/app/layout/Modal";
import {useEffect, useState} from "react";
import {MeterEquipment, Options, S318EquipmentServiceData} from "@/types";
import {Label} from "@/components/ui/label";
import InputText from "@/app/components/form/InputText";
import {Button} from "@/components/ui/button";
import InputSelect from "@/app/components/form/InputSelect";
import {getMeterEquipmentOptions} from "@/app/api/MaterialEquipmentApi";
import {Selection} from "@/app/components/form/Selection";
import {searchMeterEquipmentOptions} from "@/app/helpers/SearchMeterEquipment";

interface ModalEquipmentsProps {
  open: boolean;
  onClose: () => void;
  index: number;
  options: Options[];
  onUpdateOptions?: (options: Options[]) => void;
  data: S318EquipmentServiceData[];
  onUpdateData: (d: S318EquipmentServiceData[]) => void;
  requestCode: string;
}

const ModalEquipments = ({
                           open,
                           onClose,
                           index,
                           options,
                           onUpdateOptions,
                           data,
                           onUpdateData,
                           requestCode,
                         }: ModalEquipmentsProps) => {
  const [formData, setFormData] = useState<S318EquipmentServiceData>({} as S318EquipmentServiceData);
  const [equipmentOptions, setEquipmentOptions] = useState<Options[]>([]);

  useEffect(() => {
    setEquipmentOptions(options)
  }, [open, options]);

  useEffect(() => {
    if(index > -1) {
      setFormData(data[index])
    }
  }, [index, open]);

  const handleInputChange = (
    field: keyof S318EquipmentServiceData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.equipmentId) {
      alert("กรุณาเลือกมิเตอร์/อุปกรณ์ไฟฟ้า");
      return false;
    }
    if (!formData.capacity) {
      alert("กรุณากรอกขนาด");
      return false;
    }
    console.log('formData', formData);
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("กรุณากรอกจำนวนที่ถูกต้อง");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    let updatedData = data;
    if(index > -1) {
      updatedData[index] = formData;
    }else {
      updatedData.push(formData);
    }

    onUpdateData(updatedData);
    setTimeout(() => handleCancel(), 0);
  };

  const handleCancel = () => {
    setFormData({} as S318EquipmentServiceData);
    onClose();
  };

  return (
    <Modal
      title="เพิ่มมิเตอร์/อุปกรณ์ไฟฟ้า"
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
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            มิเตอร์/อุปกรณ์ไฟฟ้า
          </Label>
          <Selection value={formData.equipmentId ?? ""}
                     options={equipmentOptions}
                     placeholder="เลือกมิเตอร์/อุปกรณ์ไฟฟ้า"
                     onSearch={(s: string) => searchMeterEquipmentOptions(s, requestCode)}
                     onUpdateOptions={onUpdateOptions}
                     onUpdate={(v: string) => handleInputChange("equipmentId", v)}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            ขนาด
          </Label>
          <InputText
            value={formData.capacity || ""}
            placeholder="ระบุขนาดอุปกรณ์"
            onChange={(value) => handleInputChange("capacity", value)}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            จำนวน
          </Label>
          <InputText
            value={formData.amount || 0}
            placeholder="ระบุจำนวน"
            numberOnly={true}
            onChange={(value) => handleInputChange("amount", parseInt(value) || 0)}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            ราคา
          </Label>
          <InputText
            value={formData.price?.toString() || "0"}
            placeholder="ระบุราคา"
            numberOnly={true}
            onChange={(value) => handleInputChange("price", parseFloat(value) || 0)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalEquipments;

