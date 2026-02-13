"use client";
import {Insulator, S314CableServiceData} from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPencil,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";

interface ListDataContentProps {
  realData: S314CableServiceData[];
  pageData: S314CableServiceData[];
  onUpdateData: (data: S314CableServiceData[]) => void;
  onRemoveData: (id: number) => void;
  setUpdateIndex: (index: number) => void;
  page: number;
  pageSize: number;
  showActionButtons?: boolean,
  isReadOnly?: boolean
}

const ListDataContent = ({
  realData,
  pageData,
  onUpdateData,
  onRemoveData,
  setUpdateIndex,
  page,
  pageSize,
  showActionButtons = true,
  isReadOnly = false
}: ListDataContentProps) => {

  const handleUpdateData = (
    key: string,
    value: string | number | boolean | undefined,
    index: number
  ) => {
    index = page * pageSize + index;
    const newData = realData.map((item: S314CableServiceData, idx) => {
      let isEdited = item.isEdited;
      if (key === "isUpdate" && value) {
        isEdited = true;
        setUpdateIndex(index);
        value = false;
      }

      if (key === "isActive") {
        isEdited = true;
      }

      return idx === index ? { ...item, [key]: value, isEdited } : item;
    });
    onUpdateData(newData);
  };

  const deleteData = (id: number, index: number) => {
    const adjustedIndex = (page * pageSize) + index;
    const newData = realData.filter((_, idx) => adjustedIndex !== idx);
    onUpdateData(newData);
    onRemoveData(id);
  }

  return (
    <div>
      {pageData.length > 0 ? (
        pageData.map((item, index) => (
          <Card key={index} className="p-3 mb-3 shadow-none">
            <CardContent>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* หัวข้อรายการ */}
                  <div className="font-medium text-sm mb-2 text-gray-800">
                    {index + 1}. {item.cableInsulator}
                  </div>

                  {/* จำนวนหน่วย */}
                  <div className="text-sm text-gray-600">
                    <span>จำนวนหน่วย : </span>
                    <span className="font-medium text-sm text-black">
                      {item.amount || 0}
                    </span>
                  </div>
                </div>
                {showActionButtons && !isReadOnly && (
                <div className="flex space-x-2 ml-4">
                  {item.isUpdate ? (
                    <button
                      className="bg-[#C8F9E9] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
                      onClick={() => handleUpdateData("isUpdate", false, index)}
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        size={"sm"}
                        color="#31C48D"
                      />
                    </button>
                  ) : (
                    <button
                      className="bg-[#FDE5B6] rounded-[8px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                      onClick={() => handleUpdateData("isUpdate", true, index)}
                    >
                      <FontAwesomeIcon
                        icon={faPencil}
                        size={"sm"}
                        color="#F9AC12"
                      />
                    </button>
                  )}

                  <button
                    className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
                    onClick={() => deleteData(0, index)}
                  >
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      size={"sm"}
                      color="#E02424"
                    />
                  </button>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-gray p-4">
          ไม่มีรายการฉนวนครอบสายไฟฟ้า
        </div>
      )}
    </div>
  );
};

export default ListDataContent;
