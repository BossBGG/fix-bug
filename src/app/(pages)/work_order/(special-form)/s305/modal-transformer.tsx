import Modal from "@/app/layout/Modal";
import {useEffect, useState} from "react";
import {TransformerMaterialEquipmentObj, Options, WorkOrderObj, Transformer, S305TransformerServiceData} from "@/types";

import {Button} from "@/components/ui/button";
import {Selection} from "@/app/components/form/Selection";
import {
  handleSearchTransformerBrands,
  handleSearchTransformerPhase, handleSearchTransformerSize,
  handleSearchTransformerType, handleSearchTransformerVoltage
} from "@/app/helpers/SearchTransformer.";
import InputText from "@/app/components/form/InputText";

interface ModalEquipmentsProps {
  open: boolean,
  onClose: () => void,
  onAddTransformer: (d: S305TransformerServiceData) => void,
  onEditTransformer: (d: S305TransformerServiceData) => void,
  editData: S305TransformerServiceData | null,
  brandOptions: Options[],
  onUpdateBrandOptions: (options: Options[]) => void,
  phaseOptions: Options[],
  onUpdatePhaseOptions: (options: Options[]) => void,
  typeOptions: Options[],
  onUpdateTypeOptions: (options: Options[]) => void,
  sizeOptions: Options[],
  onUpdateSizeOptions: (options: Options[]) => void,
  voltageOptions: Options[],
  onUpdateVoltageOptions: (options: Options[]) => void,
  reqCode: string
}

const ModalTransformer = ({
                            open,
                            onClose,
                            onAddTransformer,
                            onEditTransformer,
                            editData,
                            brandOptions,
                            onUpdateBrandOptions,
                            phaseOptions,
                            onUpdatePhaseOptions,
                            typeOptions,
                            onUpdateTypeOptions,
                            sizeOptions,
                            onUpdateSizeOptions,
                            voltageOptions,
                            onUpdateVoltageOptions,
                            reqCode
                          }: ModalEquipmentsProps) => {

  const [transformer, setTransformer] = useState<S305TransformerServiceData>({} as S305TransformerServiceData)

  useEffect(() => {
    if (editData) {
      setTransformer(editData)
    }
  }, [editData]);

  const handleSubmit = () => {
    if(editData) {
      onEditTransformer(transformer)
    }else {
      onAddTransformer(transformer)
    }
    handleCancel()
  };

  const handleCancel = () => {
    setTransformer({} as S305TransformerServiceData)
    onClose();
  };

  const handleUpdateTransformer = (key: string, value: string) => {
    let newTransformer = {
      ...transformer,
      [key]: value
    }
    setTransformer(newTransformer);
  }

  return (
    <Modal title="เพิ่มหม้อแปลง"
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

      <div className="w-full p-2">
        <div className="mb-3">
          <div className="mb-2">ยี่ห้อ</div>
          <Selection value={transformer.transformerBrandId}
                     options={brandOptions}
                     placeholder={"ยี่ห้อ"}
                     onSearch={(s: string) => handleSearchTransformerBrands(s, reqCode)}
                     onUpdateOptions={onUpdateBrandOptions}
                     onUpdate={(v:string) => handleUpdateTransformer('transformerBrandId', v)}
          />
        </div>

        <div className="mb-3">
          <div className="mb-2">เฟส</div>
          <Selection value={transformer.transformerPhaseId}
                     options={phaseOptions}
                     placeholder={"เฟส"}
                     onSearch={(s: string) => handleSearchTransformerPhase(s, reqCode)}
                     onUpdateOptions={onUpdatePhaseOptions}
                     onUpdate={(v:string) => handleUpdateTransformer('transformerPhaseId', v)}
          />
        </div>

        <div className="mb-3">
          <div className="mb-2">ประเภท</div>
          <Selection value={transformer.transformerTypeId}
                     options={typeOptions}
                     placeholder={"ประเภท"}
                     onSearch={(s: string) => handleSearchTransformerType(s, reqCode)}
                     onUpdateOptions={onUpdateTypeOptions}
                     onUpdate={(v:string) => handleUpdateTransformer('transformerTypeId', v)}
          />
        </div>

        <div className="mb-3">
          <InputText value={transformer.transformerSerial || ""}
                     label="Serial"
                     placeholder="Serial"
                     onChange={(v: string) => handleUpdateTransformer('transformerSerial', v)}
          />
        </div>

        <div className="mb-3">
          <div className="mb-2">ขนาด</div>
          <Selection value={transformer.transformerSize as string}
                     options={sizeOptions}
                     placeholder={"ขนาด"}
                     onSearch={(s: string) => handleSearchTransformerSize(s, reqCode)}
                     onUpdateOptions={onUpdateSizeOptions}
                     onUpdate={(v:string) => handleUpdateTransformer('transformerSize', v)}
          />
        </div>

        <div className="mb-2">
          <div className="mb-2">แรงดัน</div>
          <Selection value={transformer.transformerVoltage as string}
                     options={voltageOptions}
                     placeholder={"แรงดัน"}
                     onSearch={(s: string) => handleSearchTransformerVoltage(s, reqCode)}
                     onUpdateOptions={onUpdateVoltageOptions}
                     onUpdate={(v:string) => handleUpdateTransformer('transformerVoltage', v)}
          />
        </div>
      </div>
    </Modal>
)
}

export default ModalTransformer;
