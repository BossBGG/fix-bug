import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { DataTableEditor } from "@/app/components/editor-table/DataTableEditor";
import { columns } from "@/app/(pages)/work_order/(special-form)/s314/columns";
import { useAppSelector } from "@/app/redux/hook";
import {Insulator, RequestServiceDetail, S314CableServiceData, S314ServiceData, WorkOrderObj} from "@/types";
import { ListDataEditor } from "@/app/components/editor-table/ListDataEditor";
import ListDataContent from "@/app/(pages)/work_order/(special-form)/s314/list-data-content";
import { Button } from "@/components/ui/button";
import ModalInsulators from "@/app/(pages)/work_order/(special-form)/s314/modal-insulators";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface InsulatorListOptions {
  showCardCollapse?: boolean;
  showAddButton?: boolean;
  showDeleteAllButton?: boolean;
  showActionColumn?: boolean;
  isReadOnly?: boolean;
}

interface InsulatorListProps {
  data: WorkOrderObj;
  updateData: (d: WorkOrderObj) => void;
  options?: InsulatorListOptions;
}

const InsulatorList = ({
  data,
  updateData,
  options = {},
}: InsulatorListProps) => {
  // Default options
  const {
    showCardCollapse = true,
    showAddButton = true,
    showDeleteAllButton = true,
    showActionColumn = true,
    isReadOnly = false,
  } = options;

  const itemInsulator = {
    isUpdate: true,
    isEdited: false,
  } as S314CableServiceData;

  const [insulators, setInsulators] = useState<S314CableServiceData[]>([]);
  const screenSize = useAppSelector((state) => state.screen_size);

  const [openModal, setOpenModal] = React.useState(false);
  const [updateIndex, setUpdateIndex] = React.useState(-1);
  const [editData, setEditData] = React.useState<S314CableServiceData | null>(null);

  useEffect(() => {
    let serviceSpecData = data.serviceSpecificData as S314ServiceData;
    setInsulators(serviceSpecData?.cableInsulators || [])
  }, [data.serviceSpecificData]);

 useEffect(() => {
    if (screenSize !== DESKTOP_SCREEN) {
      const newInsulators: S314CableServiceData[] = insulators?.map((item) => {
        return { ...item, isUpdate: false };
      }) || [];

      console.log("newInsulators >>> ", newInsulators);
      setInsulators(newInsulators);
    }
  }, [screenSize]);

  const onRemoveData = (id: number) => {
    console.log("Remove equipment with id:", id);
  };

  const handleUpdateInsulator = (insulators: S314CableServiceData[]) => {
    setInsulators(insulators);
    handleUpdateData(insulators);
  };

  const handleUpdateData = (insulators: S314CableServiceData[]) => {
    let newData = {
      ...data,
      serviceSpecificData: {
        ...data.serviceSpecificData as S314ServiceData,
        cableInsulators: insulators
      }
    }

    updateData(newData);
  }

  // ฟังก์ชันสำหรับเพิ่มอุปกรณ์จาก modal
  const handleAddOrEditInsulator = (insulator: S314CableServiceData) => {
    let newInsulators: S314CableServiceData[] = insulators;
    if(updateIndex > -1) {
      newInsulators[updateIndex] = insulator;
    }else {
      newInsulators.push(insulator);
    }
    handleUpdateData(newInsulators);
  };

  // Render content without CardCollapse
  const renderContent = () => {
    if (screenSize === DESKTOP_SCREEN) {
      return (
        <DataTableEditor
          columns={columns}
          onUpdateData={handleUpdateInsulator}
          visibleDelete={showDeleteAllButton}
          rowItem={itemInsulator}
          realData={insulators}
          LabelAddRow={
            showAddButton && screenSize === DESKTOP_SCREEN
              ? "เพิ่มฉนวนครอบสายไฟฟ้า"
              : undefined
          }
          onRemoveData={onRemoveData}
          hiddenColumn={!showActionColumn && {action: false}}
        />
      );
    } else {
      return (
        <ListDataEditor onUpdateData={handleUpdateInsulator} realData={insulators}>
          {(pageData: S314CableServiceData[], page, pageSize) => (
            <div>
              <ListDataContent
                pageData={pageData}
                realData={insulators}
                page={page}
                pageSize={pageSize}
                onUpdateData={handleUpdateInsulator}
                onRemoveData={onRemoveData}
                setUpdateIndex={(index) => {
                  setEditData(insulators[index])
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
                  เพิ่มฉนวนครอบสายไฟฟ้า
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
        <CardCollapse title={"ฉนวนครอบสายไฟฟ้า"}>{content}</CardCollapse>
      ) : (
        content
      )}

      {showAddButton && (
        <ModalInsulators
          open={openModal}
          onClose={() => {
            setUpdateIndex(-1)
            setEditData(null)
            setOpenModal(false)
          }}
          onAddOrEditEquipment={handleAddOrEditInsulator}
          editData={editData}
        />
      )}
    </>
  );
};

export default InsulatorList;
