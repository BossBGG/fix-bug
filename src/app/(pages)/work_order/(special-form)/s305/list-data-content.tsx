"use client";
import {Transformer, Options, S305TransformerServiceData} from "@/types";
import {Card, CardContent} from "@/components/ui/card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPencil,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";


interface ListDataContentProps {
  realData: S305TransformerServiceData[];
  pageData: S305TransformerServiceData[];
  onUpdateData: (data: S305TransformerServiceData[]) => void;
  onRemoveData: (id: number) => void;
  setUpdateIndex: (index: number) => void;
  page: number;
  pageSize: number;
  showActionButtons?: boolean,
  isReadOnly?: boolean
  brandOptions: Options[]
  phaseOptions: Options[]
  typeOptions: Options[]
  sizeOptions: Options[]
  voltageOptions: Options[]
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
                           isReadOnly = false,
                           brandOptions,
                           phaseOptions,
                           typeOptions,
                           sizeOptions,
                           voltageOptions,
                         }: ListDataContentProps) => {

  const handleUpdateData = (
    key: string,
    value: string | number | boolean | undefined,
    index: number
  ) => {
    index = page * pageSize + index;
    const newData = realData.map((item: S305TransformerServiceData, idx) => {
      let isEdited = item.isEdited;
      if (key === "isUpdate" && value) {
        isEdited = true;
        setUpdateIndex(index);
        value = false;
      }

      if (key === "isActive") {
        isEdited = true;
      }

      return idx === index ? {...item, [key]: value, isEdited} : item;
    });
    onUpdateData(newData);
  };

  const deleteData = (id: number, index: number) => {
    const adjustedIndex = (page * pageSize) + index;
    const newData = realData.filter((_, idx) => adjustedIndex !== idx);
    onUpdateData(newData);
    onRemoveData(id);
  };

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
                    {index + 1}. {brandOptions.find((brand) => brand.value == item.transformerBrandId)?.label || item.transformerBrandId}
                  </div>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col md:flex-row">
                      <div className="text-sm text-gray-600 mb-1 md:mb-0 me-2">
                        <span>เฟส : </span>
                        <span className="font-medium text-sm text-black">
                          {phaseOptions.find((phase) => phase.value == item.transformerPhaseId)?.label || item.transformerPhaseId}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-1 md:mb-0 me-2">
                        <span>ประเภท : </span>
                        <span className="font-medium text-sm text-black">
                          {typeOptions.find((type) => type.value == item.transformerTypeId)?.label || item.transformerTypeId}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-1 md:mb-0 me-2">
                        <span>Serial : </span>
                        <span className="font-medium text-sm text-black">
                          {item.transformerSerial || ''}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-1 md:mb-0 me-2">
                        <span>ขนาด : </span>
                        <span className="font-medium text-sm text-black">
                          {sizeOptions.find((size) => size.value == item.transformerSize)?.label || item.transformerSize}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span>แรงดัน : </span>
                        <span className="font-medium text-sm text-black">
                          {voltageOptions.find((volt) => volt.value == item.transformerVoltage)?.label || item.transformerVoltage}
                        </span>
                      </div>
                    </div>

                    {showActionButtons && !isReadOnly && (
                      <div className="flex space-x-2 ml-4">
                        {item.isUpdate ? (
                          <button
                            className="bg-[#C8F9E9] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
                            onClick={() =>
                              handleUpdateData("isUpdate", false, index)
                            }
                          >
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              size={"sm"}
                              color="#31C48D"
                            />
                          </button>
                        ) : (
                          <button
                            className="bg-[#FDE5B6] rounded-[8px] mr-2 w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                            onClick={() =>
                              handleUpdateData("isUpdate", true, index)
                            }
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-gray p-4">ไม่มีรายการวัสดุอุปกรณ์</div>
      )}
    </div>
  );
};

export default ListDataContent;
