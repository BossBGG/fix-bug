import Modal from "@/app/layout/Modal";
import {cn} from "@/lib/utils";
import {useEffect, useState} from "react";
import InputSelect from "@/app/components/form/InputSelect";
import {Insulator, MaterialEquipmentObj, Options, S314CableServiceData} from "@/types";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import InputText from "@/app/components/form/InputText";
import { Button } from "@/components/ui/button";

interface ModalEquipmentsProps {
  open: boolean,
  onClose: () => void,
  onAddOrEditEquipment: (insulator: S314CableServiceData) => void,
  editData: S314CableServiceData | null
}

const ModalInsulators = ({
                           open,
                           onClose,
                           onAddOrEditEquipment,
                           editData
                         }: ModalEquipmentsProps) => {
  const [insulator, setInsulator] = useState<S314CableServiceData>({} as S314CableServiceData);

  useEffect(() => {
    if(editData) {
      setInsulator(editData);
    }
  }, [editData]);

  const handleChange = (key: keyof S314CableServiceData, value: string | number) => {
    let newInsulator: S314CableServiceData = {
      ...insulator,
      [key]: value
    }

    setInsulator(newInsulator);
  }

  const handleSubmit = () => {
    onAddOrEditEquipment(insulator)
    handleCancel()
  }

  const handleCancel = () => {
    setInsulator({} as S314CableServiceData)
    onClose();
  }

  return (
    <Modal title="เพิ่มวัสดุอุปกรณ์"
           footer={
            <div className="w-full flex flex-wrap justify-between items-center">
              <div className=" p-2 w-1/2">
              <Button
              className="text-[#671FAB] w-full bg-white border-1 border-[#671FAB] rounded-full font-semibold md:text-start text-center cursor-pointer hover:bg-white"
              onClick={handleCancel}
              >
                ยกเลิก
              </Button>
              </div>
               <div className=" p-2 w-1/2">
               <Button className="pea-button w-full" onClick={handleSubmit}>
                บันทึก
               </Button>
              </div>
           </div>
           }
           open={open} onClose={onClose}>
      <div className="mb-3">
        <InputText value={insulator.cableInsulator || ""}
                   label={"ประเภทฉนวนครอบสายไฟฟ้า"}
                   placeholder="ประเภท"
                   onChange={(value: string) => handleChange("cableInsulator", value)}
        />
      </div>

      <InputText value={insulator.amount || ""}
                 label={"จำนวน"}
                 placeholder="จำนวน"
                 onChange={(value: string) => handleChange("amount", parseInt(value))}
      />
    </Modal>
  )
}

export default ModalInsulators;
