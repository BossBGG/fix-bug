import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { DataTableEditor } from "@/app/components/editor-table/DataTableEditor";
import { columns } from "@/app/(pages)/work_order/(special-form)/s308/columns";
import { useAppSelector } from "@/app/redux/hook";
import { Transformer, TransformerMaterialEquipmentObj } from "@/types";
import { ListDataEditor } from "@/app/components/editor-table/ListDataEditor";
import ListDataContent from "@/app/(pages)/work_order/(special-form)/s308/list-data-content";
import { Button } from "@/components/ui/button";
import ModalEquipments from "@/app/(pages)/work_order/(special-form)/s308/modal-equipments";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface TransformerListOptions {
  showCardCollapse?: boolean;
  showAddButton?: boolean;
  showDeleteAllButton?: boolean;
  showActionColumn?: boolean;
  isReadOnly?: boolean;
}

interface TransformerListProps {
  data: Transformer[];
  updateData: (data: Transformer[]) => void;
  options?: TransformerListOptions;
}

const TransformerList = ({
  data,
  updateData,
  options = {},
}: TransformerListProps) => {
  // Default options
  const {
    showCardCollapse = true,
    showAddButton = true,
    showDeleteAllButton = true,
    showActionColumn = true,
    isReadOnly = false,
  } = options;

  const itemTransformer = {
    isUpdate: true,
    isEdited: false,
  } as Transformer;

  const [transformers, setTransformers] = useState<Transformer[]>(data || []);
  const screenSize = useAppSelector((state) => state.screen_size);

  const [openModal, setOpenModal] = React.useState(false);
  const [updateIndex, setUpdateIndex] = React.useState(-1);

  const transformerNameOptions = [
    { label: "หม้อแปลง3P5000KVA(รายปี)", value: "หม้อแปลง3P5000KVA(รายปี)" },
  ];

  useEffect(() => {
    setTransformers(data || []);
  }, [data]);

  useEffect(() => {
    if (screenSize !== DESKTOP_SCREEN) {
      const newTransformers: Transformer[] = transformers.map((item) => {
        return { ...item, isUpdate: false };
      });

      console.log("newTransformers >>> ", newTransformers);
      setTransformers(newTransformers);
    }
  }, [screenSize]);

  const onRemoveData = (id: number) => {
    console.log("Remove equipment with id:", id);
  };

  const handleUpdateData = (data: Transformer[]) => {
    setTransformers(data);
    updateData(data);
  };

  // ฟังก์ชันสำหรับเพิ่มอุปกรณ์จาก modal
  const handleAddEquipment = (equipment: TransformerMaterialEquipmentObj) => {
    const newTransformer: Transformer = {
      // id: Date.now(),
      // name: equipment.name || "อุปกรณ์ไฟฟ้าใหม่",
      // type: equipment.type || "1",
      // serial: equipment.serial || "1",
      // size: equipment.size || "1",
      // pressure: equipment.pressure || "-",
      isUpdate: false,
      isEdited: false,
    } as Transformer;

    const updatedTransformers = [...transformers, newTransformer];
    setTransformers(updatedTransformers);
    updateData(updatedTransformers);
  };

  const getFilteredColumns = () => {
    if (!showActionColumn) {
      return columns.filter((columns) => columns.id !== "action");
    }
    return columns;
  };

  // Render content without CardCollapse
  const renderContent = () => {
    if (screenSize === DESKTOP_SCREEN) {
      return (
        <DataTableEditor
          columns={getFilteredColumns()}
          onUpdateData={handleUpdateData}
          visibleDelete={showDeleteAllButton}
          rowItem={itemTransformer}
          realData={transformers}
          LabelAddRow={showAddButton && screenSize === DESKTOP_SCREEN ? "เพิ่มหม้อแปลง" : undefined}
          onRemoveData={onRemoveData}
        />
      );
    } else {
      return (
        <ListDataEditor onUpdateData={handleUpdateData} realData={transformers}>
          {(pageData: Transformer[], page, pageSize) => (
            <div>
              <ListDataContent
                pageData={pageData}
                realData={transformers}
                page={page}
                pageSize={pageSize}
                onUpdateData={handleUpdateData}
                equipmentNameOptions={transformerNameOptions}
                onRemoveData={onRemoveData}
                setUpdateIndex={(index) => {
                  setUpdateIndex(index);
                  setOpenModal(true);
                }}
                showActionButtons={showActionColumn}
                isReadOnly={isReadOnly}
              />

              {showAddButton && (
              <Button
                className="pea-button-outline my-2 w-full"
                onClick={() => setOpenModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                เพิ่มหม้อแปลง
              </Button>
              )}
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
        <CardCollapse title={"รายละเอียดหม้อแปลง"}>{content}</CardCollapse>
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

export default TransformerList;
