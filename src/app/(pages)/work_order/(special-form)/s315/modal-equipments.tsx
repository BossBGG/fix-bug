import Modal from "@/app/layout/Modal";
import {useEffect, useState} from "react";
import {S315TransformerServiceData, TransFormerS315} from "@/types";
import InputText from "@/app/components/form/InputText";
import {Button} from "@/components/ui/button";

interface ModalAddOrEditTransFormerProps {
  open: boolean,
  onClose: () => void,
  onAddTransFormer: (data: S315TransformerServiceData) => void,
  editData: S315TransformerServiceData | undefined,
  onUpdateTransFormer: (d: S315TransformerServiceData) => void,
}

const ModalAddOrEditTransFormer = ({
                                     open,
                                     onClose,
                                     onAddTransFormer,
                                     editData,
                                     onUpdateTransFormer
                                   }: ModalAddOrEditTransFormerProps) => {
  const [transformerData, setTransformerData] = useState<S315TransformerServiceData>({} as S315TransformerServiceData);

  useEffect(() => {
    if (editData) {
      setTransformerData(editData);
    }
  }, [editData]);

  const handleSubmit = () => {
    if (editData) {
      onUpdateTransFormer(transformerData);
    }else {
      onAddTransFormer(transformerData)
    }
    handleCancel()
  }

  const handleChangeData = (key: keyof S315TransformerServiceData, value: string | number) => {
    setTransformerData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCancel = () => {
    onClose();
    setTransformerData({} as S315TransformerServiceData);
  }

  return (
    <Modal title={`${editData ? 'แก้ไข' : 'เพิ่ม'}หม้อแปลง`}
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

      <InputText value={transformerData?.transformerCapacity as string || ""}
                 placeholder={"ขนาดหม้อแปลง"}
                 label={"ขนาดหม้อแปลง"}
                 onChange={(value: string) => handleChangeData('transformerCapacity', value)}
      />

      <InputText value={transformerData?.amount || ""}
                 placeholder={"จำนวน"}
                 label={"จำนวน"}
                 onChange={(value: string) => handleChangeData('amount', parseInt(value))}
                 numberOnly={true}
      />

    </Modal>
  )
}

export default ModalAddOrEditTransFormer;
