"use client";
import { MaterialEquipmentObj, Options } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPencil,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import AddMaterial from "./AddMaterial";

interface MaterialEquipmentListContentProps {
  realData: MaterialEquipmentObj[];
  pageData: MaterialEquipmentObj[];
  onUpdateData: (data: MaterialEquipmentObj[]) => void;
  onRemoveData: (id: number) => void;
  setUpdateIndex: (index: number) => void;
  page: number;
  pageSize: number;
  materialOptions: Options[];
  showActionButtons?: boolean;
  isReadOnly?: boolean;
  office?: string;
}

const MaterialEquipmentListContent = ({
  realData,
  pageData,
  onUpdateData,
  onRemoveData,
  setUpdateIndex,
  page,
  pageSize,
  materialOptions,
  showActionButtons = true,
  isReadOnly = false,
  office = "",
}: MaterialEquipmentListContentProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingItem, setEditingItem] = useState<MaterialEquipmentObj | null>(
    null
  );

  const handleUpdateData = (
    key: string,
    value: string | number | boolean | undefined,
    index: number
  ) => {
    if (isReadOnly) return;

    const adjustedIndex = page * pageSize + index;

    if (key === "isUpdate" && value) {

      const itemToEdit = realData[adjustedIndex];

      setEditingIndex(adjustedIndex);
      setEditingItem(itemToEdit);
      setShowEditModal(true);

      return;
    }

    const newData = realData.map((item: MaterialEquipmentObj, idx) => {
      let isEdited = item.isEdited;

      if (key === "isActive") {
        isEdited = true;
      }

      return idx === adjustedIndex ? { ...item, [key]: value, isEdited } : item;
    });
    onUpdateData(newData);
  };

  const deleteData = (id: number, index: number) => {
    if (isReadOnly) return;

    const adjustedIndex = page * pageSize + index;
    const newData = realData.filter((_, idx) => adjustedIndex !== idx);
    onUpdateData(newData);
    onRemoveData(id);
  };

  const getMaterialName = (code: string) => {
    const material = materialOptions.find((m) => m.value === code);
    return material ? material.label : code;
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingIndex(-1);
    setEditingItem(null);
  };

  const handleEditModalSave = (
    materials: MaterialEquipmentObj | MaterialEquipmentObj[]
  ) => {
    const materialArray = Array.isArray(materials) ? materials : [materials];

    if (editingIndex >= 0 && materialArray.length > 0) {
      const material = materialArray[0];
      const newData = realData.map((item, idx) =>
        idx === editingIndex
          ? {
              ...material,
              isUpdate: false,
              isEdited: true,

              id: item.id,
              uuid: item.uuid,
              originalId: item.originalId,
              materialSetUuid: item.materialSetUuid,
            }
          : item
      );
      onUpdateData(newData);
    }
    handleEditModalClose();
  };

  return (
    <div>
      {pageData.length > 0 ? (
        pageData.map((item, index) => (
          <Card key={index} className="p-3 mb-3 shadow-none">
            <CardContent>
              <div className="flex flex-col justify-between">
                <div className="flex-1">
                  <div className="font-medium text-lg mb-2">
                    {index + 1}. {item.code || ""}{" "}
                    {item.name || getMaterialName(item.name || "")}
                  </div>
                </div>

                <div className="flex justify-between items-start md:mt-0 mt-3 space-x-2">
                  <div className="flex flex-col space-y-1 text-sm text-gray-600">
                    <div className="flex justify-start">
                      <span>จำนวนหน่วย :</span>
                      <span className="font-medium text-md ml-2">
                        {item.quantity || "1"}
                      </span>
                    </div>

                    <div className="flex justify-start">
                      <span>หน่วย :</span>
                      <span className="font-medium text-md ml-2">
                        {item.unit || "ชิ้น"}
                      </span>
                    </div>

                    <div className="flex justify-start">
                      <span>ราคาวัสดุ :</span>
                      <span className="font-medium text-md ml-2">
                        {item.price
                          ? `${Number(item.price).toLocaleString()}.00`
                          : "0.00"}
                      </span>
                    </div>
                  </div>

                  {showActionButtons && !isReadOnly && (
                    <div>
                      <div className="flex flex-row items-center justify-between ">
                        {item.isUpdate ? (
                          <button
                            className="bg-[#C8F9E9] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
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
                            className="bg-[#FDE5B6] rounded-[8px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
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
                          className="bg-[#FFD4D4] rounded-[8px] ml-2 p-2 flex items-center justify-center cursor-pointer"
                          onClick={() => deleteData(item.id || 0, index)}
                        >
                          <FontAwesomeIcon
                            icon={faTrashCan}
                            size={"sm"}
                            color="#E02424"
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-gray-500 p-4">
          ไม่มีรายการวัสดุอุปกรณ์
        </div>
      )}

      {showEditModal && editingItem && (
        <AddMaterial
          open={showEditModal}
          onClose={handleEditModalClose}
          index={editingIndex}
          onAddMaterial={handleEditModalSave}
          editMode={true}
          existingSelections={[editingItem.id]}
          editingItem={editingItem}
          office={office}
          existingMaterials={realData}
        />
      )}
    </div>
  );
};

export default MaterialEquipmentListContent;
