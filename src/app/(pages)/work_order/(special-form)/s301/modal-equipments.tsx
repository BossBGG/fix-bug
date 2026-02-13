import Modal from "@/app/layout/Modal";
import {useState} from "react";
import {Options, S301EquipmentServiceData} from "@/types";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import InputText from "@/app/components/form/InputText";
import {Button} from "@/components/ui/button";
import InputSearch from "@/app/components/form/InputSearch";
import handleSearchServiceEquipmentType from "@/app/helpers/SearchServiceEquipmentType";

interface ModalEquipmentsProps {
  open: boolean,
  onClose: () => void,
  updateIndex: number
  options: Options[],
  onUpdateOptions?: (options: Options[]) => void,
  data: S301EquipmentServiceData[],
  onUpdateData: (d: S301EquipmentServiceData[]) => void,
  requestCode: string
}

const ModalEquipments = ({
                           open,
                           onClose,
                           updateIndex,
                           options,
                           onUpdateOptions,
                           data,
                           onUpdateData,
                           requestCode
                         }: ModalEquipmentsProps) => {
  const [equipmentSelected, setEquipmentSelected] = useState<S301EquipmentServiceData[]>(data);
  const [serviceEquipmentOptions, setServiceEquipmentOptions] = useState<Options[]>(options);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      let newData: S301EquipmentServiceData[] = serviceEquipmentOptions.map((sv) => (
        {
          equipmentTypeId: sv.value as string,
          amount: getQuantity(sv),
          isUpdate: false,
          isEdited: false
        }
      ))

      setEquipmentSelected(newData)
    } else {
      setEquipmentSelected([])
    }
  }

  const handleCheck = (checked: boolean, item: Options) => {
    if (checked) {
      let newData: S301EquipmentServiceData[] = [
        ...equipmentSelected,
        {
          equipmentTypeId: item.value as string,
          amount: 0,
          isUpdate: false,
          isEdited: false
        }
      ]

      setEquipmentSelected(newData);
    } else {
      const newData = equipmentSelected.filter((eq) => eq.equipmentTypeId != item.value)

      setEquipmentSelected(newData);
    }
  }

  const handleQuantityChange = (id: string, newQuantity: string) => {
    const newData = equipmentSelected.map((d) =>
      d.equipmentTypeId == id ? {...d, amount: parseInt(newQuantity)} : d
    ) as S301EquipmentServiceData[];

    setEquipmentSelected(newData);
  };

  const handleSubmit = () => {
    let newOptions = options;
    serviceEquipmentOptions.map((opt) => {
      const inOption = options.find((option) => option.value === opt.value)
      if (!inOption) {
        newOptions.push(opt);
      }
    })
    onUpdateOptions?.(newOptions)
    onUpdateData(equipmentSelected);

    // Reset selections
    setEquipmentSelected([]);
    onClose();
  };

  const handleCancel = () => {
    setEquipmentSelected([]);
    onClose();
  };

  const getCheckState = (item: Options) => {
    if (equipmentSelected.length > 0) {
      if (equipmentSelected.find((d) => d.equipmentTypeId == item.value)) {
        return true
      }
      return false;
    }
    return false
  }

  const getQuantity = (item: Options) => {
    return equipmentSelected.find((d) => d.equipmentTypeId === item.value)?.amount || 0
  }

  const handleSearch = async (s: string) => {
    const opts = await handleSearchServiceEquipmentType(s, requestCode);
    setServiceEquipmentOptions(opts);
  }

  return (
    <Modal title={(updateIndex > -1 ? 'แก้ไข' : 'เพิ่ม') + 'ประเภทอุปกรณ์ไฟฟ้า'}
           classContent="h-[600px] flex flex-col"
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

      <div className="flex flex-col h-full">
        <InputSearch handleSearch={handleSearch}
                     placeholder="ค้นหาประเภทอุปกรณ์ไฟฟ้า"
        />

        <hr className="my-3"/>

        <div className="mb-3">รายการวัสดุ ({serviceEquipmentOptions.length || 0})</div>

        {
          serviceEquipmentOptions.length > 0 &&
          <div className="flex items-center mb-4 gap-2">
            <Checkbox id="all"
                      className="border-[#9538EA] data-[state=checked]:border-none data-[state=checked]:bg-[#9538EA]"
                      onCheckedChange={handleSelectAll}
                      checked={equipmentSelected.length === serviceEquipmentOptions.length}
            />
            <Label htmlFor="all">เลือกทั้งหมด</Label>
          </div>
        }

        <div className="flex-1 overflow-y-auto space-y-3">
          {
            serviceEquipmentOptions.length > 0 ?
              serviceEquipmentOptions.map((item, index) => (
                <div className="flex items-center p-3 bg-[#FAF5FF] rounded-[12px] border-1 gap-3"
                     key={index}
                >
                  <Checkbox id={`equipment_${index}`}
                            className="border-[#9538EA] data-[state=checked]:border-none data-[state=checked]:bg-[#9538EA]"
                            checked={getCheckState(item)}
                            onCheckedChange={(checked: boolean) => handleCheck(checked, item)}
                  />
                  <Label htmlFor={`equipment_${index}`} className="flex flex-col items-start w-full">
                    <div className="font-medium">{index + 1}. {item.label}</div>
                    <div className="flex justify-between items-center w-full">
                      <div className="text-[14px] text-[#4A4A4A]">จำนวน :</div>
                      <div className="w-[15%]">
                        <InputText value={getQuantity(item)}
                                   align="center"
                                   numberOnly={true}
                                   onChange={(value) => handleQuantityChange(item.value as string, value)}
                                   disabled={!getCheckState(item)}
                        />
                      </div>
                    </div>
                  </Label>
                </div>
              ))
              : <div className="text-[grey] py-2 text-md text-center">ไม่พบประเภทอุปกรณ์ไฟฟ้า</div>
          }
        </div>
      </div>
    </Modal>
  )
}

export default ModalEquipments;
