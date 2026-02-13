'use client';
import {MeterEquipment, Options, S318EquipmentServiceData} from "@/types";
import {Card, CardContent} from "@/components/ui/card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faPencil, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import React from "react";

interface ListDataContentProps {
  realData: S318EquipmentServiceData[],
  pageData: S318EquipmentServiceData[],
  onUpdateData: (data: S318EquipmentServiceData[]) => void,
  onRemoveData: (id: number | string) => void,
  setUpdateIndex: (index: number) => void,
  page: number,
  pageSize: number,
  meterEquipmentOptions: Options[],
  showActionButtons?: boolean;
  isReadOnly?: boolean;
  requestCode: string;
}

const ListDataContent = ({
                           realData,
                           pageData,
                           onUpdateData,
                           onRemoveData,
                           setUpdateIndex,
                           page,
                           pageSize,
                           meterEquipmentOptions,
                           showActionButtons = true,
                           isReadOnly = false,
                           requestCode
                         }: ListDataContentProps) => {

  const handleUpdateData = (key: string, value: string | number | boolean | undefined, index: number) => {
    if (isReadOnly) return;

    index = (page * pageSize) + index
    const newData = realData.map((item: S318EquipmentServiceData, idx) => {
      let isEdited = item.isEdited;
      if (key === "isUpdate" && value) {
        isEdited = true;
        setUpdateIndex(index);
        value = false;
      }

      if(key === 'isActive') {
        isEdited = true
      }

      return idx === index ? {...item, [key]: value, isEdited} : item;
    })
    onUpdateData(newData);
  }

  const deleteData = (id: number | string, index: number) => {
    if (isReadOnly) return;

    const adjustedIndex = (page * pageSize) + index;
    const newData = realData.filter((_, idx) => adjustedIndex !== idx);
    onUpdateData(newData);
    onRemoveData(id);
  }

  const getEquipmentName = (equipmentId: string) => {
    const equipment = meterEquipmentOptions.find((opt) => opt.value == equipmentId);
    return equipment ? equipment.label : equipmentId;
  }

  return (
    <div>
      {
        pageData.length > 0
          ?
          pageData.map((item, index) => (
            <Card key={index} className="p-3 mb-3 shadow-none">
              <CardContent>
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-lg mb-2">
                      {index + 1}. {getEquipmentName(item.equipmentId || "")}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex">
                        <span>ขนาด :</span>
                        <span className="font-medium ml-2">{item.capacity || '-'}</span>
                      </div>

                      <div className="flex">
                        <span>จำนวนหน่วย :</span>
                        <span className="font-medium ml-2">{item.amount || 0}</span>
                      </div>

                      <div className="flex">
                        <span>ราคา :</span>
                        <span className="font-medium ml-2">
                          {item.price ? `${Number(item.price).toLocaleString()}` : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {showActionButtons && !isReadOnly && (
                  <div className="flex justify-end items-start md:mt-0 mt-6 space-x-2">
                    {
                      item.isUpdate ?
                        <button
                          className="bg-[#C8F9E9] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
                          onClick={() => handleUpdateData('isUpdate', false, index)}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} size={"sm"} color="#31C48D"/>
                        </button>
                        :
                        <button
                          className="bg-[#FDE5B6] rounded-[8px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                          onClick={() => handleUpdateData('isUpdate', true, index)}
                        >
                          <FontAwesomeIcon icon={faPencil} size={"sm"} color="#F9AC12"/>
                        </button>
                    }

                    <button
                      className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
                      onClick={() => deleteData(item.equipmentId || "", index)}>
                      <FontAwesomeIcon icon={faTrashCan} size={"sm"} color="#E02424"/>
                    </button>
                  </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
          : <div className="text-center text-gray-500 p-4">ไม่มีรายการมิเตอร์/อุปกรณ์ไฟฟ้า</div>
      }
    </div>
  )
}

export default ListDataContent;



