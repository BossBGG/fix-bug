import Modal from "@/app/layout/Modal";
import {Button} from "@/components/ui/button";
import InputSelect from "@/app/components/form/InputSelect";
import {MaterialEquipmentObj, MaterialOptionObj, Options} from "@/types";
import InputText from "@/app/components/form/InputText";
import React, {useEffect, useState} from "react";
import {Selection} from "@/app/components/form/Selection";
import {handleSearchMaterial} from "@/app/helpers/SearchMaterial";

const FooterModal = ({
                       cancel,
                       submit
                     }:
                     {
                       cancel: () => void,
                       submit: () => void,
                     }) => (
  <div className="w-full flex flex-wrap justify-between items-center">
    <div className="p-2 w-1/2">
      <Button
        className="text-[#671FAB] w-full bg-white border-1 border-[#671FAB] rounded-full font-semibold md:text-start text-center cursor-pointer"
        onClick={() => cancel()}
      >
        ยกเลิก
      </Button>
    </div>
    <div className="p-2 w-1/2">
      <Button className="pea-button w-full" onClick={() => submit()}>
        บันทึก
      </Button>
    </div>
  </div>
)

interface ModalAddOrEditMaterialsProps {
  open: boolean,
  onClose: () => void,
  materialCodeOptions: Options[],
  materialNameOptions: Options[],
  materialOriginalOptions: MaterialOptionObj[],
  data: MaterialEquipmentObj[],
  onUpdate: (data: MaterialEquipmentObj[]) => void,
  index: number,
  setUpdateIndex: (index: number) => void,
}

const ModalAddOrEditMaterials = ({
                                   open,
                                   onClose,
                                   materialCodeOptions,
                                   materialNameOptions,
                                   materialOriginalOptions,
                                   data,
                                   onUpdate,
                                   index,
                                   setUpdateIndex,
                                 }: ModalAddOrEditMaterialsProps) => {
  const [item, setItem] = useState<MaterialEquipmentObj>({} as MaterialEquipmentObj);

  useEffect(() => {
    console.log('index >>>> ', index);
    if (index > -1) {
      setItem(data[index]);
    }
  }, [index])

  const submit = () => {
    if (index === -1) {
      data.push(item)
    } else {
      data[index] = {
        ...item,
        isEdited: true,
      }
    }

    onUpdate(data)
    cancel()
  }

  const handleUpdate = (key: string, value: string | number, option: MaterialOptionObj | null = null) => {
    let material: MaterialOptionObj[] = []
    if(key === 'code' || key === 'name') {
      const inOption = materialOriginalOptions.some((mat) => mat[key] === value)
      if(!inOption && option) {
        materialOriginalOptions.push(option)
        materialCodeOptions.push({label: option.code, value: option.code, data: option})
        materialNameOptions.push({label: option.name, value: option.name, data: option})
      }

      material = materialOriginalOptions.filter((obj) => {
        return key === 'code' ? obj.code === value : obj.name === value
      })
    }

    setItem(prev => ({
      ...prev,
      [key]: value,
      name: material.length > 0 ? material[0].name : prev.name,
      code: material.length > 0 ? material[0].code : prev.code,
      unit: material.length > 0 ? material[0].unit : prev.unit,
    }))
  }

  const cancel = () => {
    setUpdateIndex(-1)
    setItem({} as MaterialEquipmentObj)
    onClose()
  }

  return (
    <Modal title={index > -1 ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์'}
           footer={<FooterModal cancel={cancel} submit={submit}/>}
           open={open}
           onClose={cancel}
    >
      <div>
        <div className="mb-3">รหัสวัสดุ</div>
        <Selection value={item.code}
                   options={materialCodeOptions}
                   placeholder={'ค้นหารหัสวัสดุ'}
                   onUpdate={(value: string, item: MaterialOptionObj) => handleUpdate('code', value, item)}
                   onSearch={(s: string) => handleSearchMaterial(s, "code", "code")}
        />
      </div>

      <div>
        <div className="mb-3">ชื่ออุปกรณ์</div>
        <Selection value={item.name}
                   options={materialNameOptions}
                   placeholder={'ค้นหาชื่ออุปกรณ์'}
                   onUpdate={(value: string, item: MaterialOptionObj) => handleUpdate('name', value, item)}
                   onSearch={(s: string) => handleSearchMaterial(s, "name", "name")}
        />
      </div>

      <InputText placeholder={'ระบุจำนวน'}
                 label="จำนวน"
                 onChange={(v) => handleUpdate('quantity', v)}
                 value={item.quantity}
                 numberOnly={true}
      />

      <div className="w-full">
        <span className="text-[#4A4A4A]">หน่วย : </span>
        <span className="text-[#160C26]">{item.unit || '-'}</span>
      </div>
    </Modal>
  )
}

export default ModalAddOrEditMaterials;
