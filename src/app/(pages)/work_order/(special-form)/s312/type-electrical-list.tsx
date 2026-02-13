import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { DataTableEditor } from "@/app/components/editor-table/DataTableEditor";
import { columns } from "@/app/(pages)/work_order/(special-form)/s312/columns";
import { useAppSelector } from "@/app/redux/hook";
import { ElectricalEquipment, MaterialEquipmentObj } from "@/types";
import { ListDataEditor } from "@/app/components/editor-table/ListDataEditor";
import ListDataContent from "@/app/(pages)/work_order/(special-form)/s312/list-data-content";
import { Button } from "@/components/ui/button";
import ModalEquipments from "@/app/(pages)/work_order/(special-form)/s312/modal-equipments";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface TypeElectricalListOptions {
  showCardCollapse?: boolean;
  showAddButton?: boolean;
  showDeleteAllButton?: boolean;
  showActionColumn?: boolean;
  isReadOnly?: boolean;
}

interface TypeElectricalListProps {
  data: ElectricalEquipment[];
  updateData: (data: ElectricalEquipment[]) => void;
  options?: TypeElectricalListOptions;
}

const TypeElectricalList = ({
  data,
  updateData,
  options = {},
}: TypeElectricalListProps) => {
  // Default options
  const {
    showCardCollapse = true,
    showAddButton = true,
    showDeleteAllButton = true,
    showActionColumn = true,
    isReadOnly = false,
  } = options;

  const itemElectricalEquipment = {
    id: 0,
    name: "",
    quantity: 0,
    isUpdate: true,
    isEdited: false,
  } as ElectricalEquipment;

  const [electricalEquipments, setElectricalEquipments] =
    useState<ElectricalEquipment[]>(data);
  const screenSize = useAppSelector((state) => state.screen_size);

  const [openModal, setOpenModal] = React.useState(false);
  const [updateIndex, setUpdateIndex] = React.useState(-1);

  const electricalTypeOptions = [
    { label: "มิเตอร์ไฟฟ้า", value: "มิเตอร์ไฟฟ้า" },
    {
      label: "อุปกรณ์ประกอบในระบบวัดพลังงานไฟฟ้าและอื่นๆ",
      value: "อุปกรณ์ประกอบในระบบวัดพลังงานไฟฟ้าและอื่นๆ",
    },
    {
      label: "อุปกรณ์ประกอบในระบบควบคุมหรือป้องกัน",
      value: "อุปกรณ์ประกอบในระบบควบคุมหรือป้องกัน",
    },
    { label: "หม้อแปลงไฟฟ้า", value: "หม้อแปลงไฟฟ้า" },
    { label: "อุปกรณ์สวิตซ์เกียร์", value: "อุปกรณ์สวิตซ์เกียร์" },
    { label: "อุปกรณ์ป้องกันฟ้าผ่า", value: "อุปกรณ์ป้องกันฟ้าผ่า" },
    { label: "อุปกรณ์อื่นๆ", value: "อุปกรณ์อื่นๆ" },
  ];

  useEffect(() => {
    if (screenSize !== DESKTOP_SCREEN) {
      const newElectricalEquipments: ElectricalEquipment[] =
        electricalEquipments.map((item) => {
          return { ...item, isUpdate: false };
        });

      console.log("newElectricalEquipments >>> ", newElectricalEquipments);
      setElectricalEquipments(newElectricalEquipments);
    }
  }, [screenSize]);



  const onRemoveData = (id: number) => {
    console.log("Remove equipment with id:", id);
  };

  const handleUpdateData = (data: ElectricalEquipment[]) => {
    setElectricalEquipments(data);
    updateData(data);
  };

  // ฟังก์ชันสำหรับเพิ่มอุปกรณ์จาก modal
  const handleAddEquipment = (equipment: MaterialEquipmentObj) => {
    const newElectricalEquipment: ElectricalEquipment = {
      id: Date.now(),
      name: equipment.name || "อุปกรณ์ไฟฟ้าใหม่",
      quantity:
        typeof equipment.quantity === "string"
          ? parseInt(equipment.quantity) || 1
          : equipment.quantity || 1,
      isUpdate: false,
      isEdited: false,
    };

    const updatedElectricalEquipments = [
      ...electricalEquipments,
      newElectricalEquipment,
    ];
    setElectricalEquipments(updatedElectricalEquipments);
    updateData(updatedElectricalEquipments);
  };

  // Filter columns based on options
  const getFilteredColumns = () => {
    if (!showActionColumn) {
      return columns.filter((column) => column.id !== "action");
    }
    return columns;
  };

  const renderContent = () => {
    if (screenSize === DESKTOP_SCREEN) {
      return (
        <DataTableEditor
          columns={getFilteredColumns()}
          onUpdateData={handleUpdateData}
          visibleDelete={showDeleteAllButton}
          rowItem={itemElectricalEquipment}
          realData={electricalEquipments}
          LabelAddRow={
            showAddButton && screenSize === DESKTOP_SCREEN ? "เพิ่มประเภทอุปกรณ์ไฟฟ้า" : undefined
          }

          onRemoveData={onRemoveData}
        />
      );
    } else {
      return (
        <ListDataEditor
          onUpdateData={handleUpdateData}
          realData={electricalEquipments}
        >
          {(pageData: ElectricalEquipment[], page, pageSize) => (
            <div>
              <ListDataContent
                pageData={pageData}
                realData={electricalEquipments}
                page={page}
                pageSize={pageSize}
                onUpdateData={handleUpdateData}
                equipmentNameOptions={electricalTypeOptions}
                onRemoveData={onRemoveData}
                setUpdateIndex={(index) => {
                  setUpdateIndex(index);
                  setOpenModal(true);
                }}
                showActionButtons={showActionColumn}
                isReadOnly={isReadOnly}
              />

              <Button
                className="pea-button-outline my-2 w-full"
                onClick={() => setOpenModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                เพิ่มประเภทอุปกรณ์ไฟฟ้า
              </Button>
            </div>
          )}
        </ListDataEditor>
      );
    }
  };

  const content = renderContent();

  return (
    <>
      {showCardCollapse ? (
        <CardCollapse title={"ประเภทอุปกรณ์ไฟฟ้า"}>{content}</CardCollapse>
      ) : (
        content
      )}

      {showAddButton && (
        <ModalEquipments
          open={openModal}
          onClose={() => setOpenModal(false)}
          index={updateIndex}
          onAddEquipment={handleAddEquipment}
        />
      )}
    </>
  );
};

export default TypeElectricalList;
