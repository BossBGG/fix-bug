import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { DataTableEditor } from "@/app/components/editor-table/DataTableEditor";
import {getColumns} from "@/app/(pages)/work_order/(special-form)/s318/columns";
import { useAppSelector } from "@/app/redux/hook";
import {
  MeterEquipment,
  Options,
  RequestServiceDetail,
  S318EquipmentServiceData,
  S318ServiceData,
  WorkOrderObj
} from "@/types";
import { ListDataEditor } from "@/app/components/editor-table/ListDataEditor";
import ListDataContent from "@/app/(pages)/work_order/(special-form)/s318/list-data-content";
import { Button } from "@/components/ui/button";
import ModalEquipments from "@/app/(pages)/work_order/(special-form)/s318/modal-equipments";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import { getMeterEquipmentOptions } from "@/app/api/MaterialEquipmentApi";
import {Card} from "@/components/ui/card";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface MeterEquipmentListOptions {
  showCardCollapse?: boolean;
  showAddButton?: boolean;
  showDeleteAllButton?: boolean;
  showActionColumn?: boolean;
  isReadOnly?: boolean;
}

interface MeterEquipmentListProps {
  data: WorkOrderObj;
  updateData?: (data: WorkOrderObj) => void;
  options?: MeterEquipmentListOptions;
  meterEquipmentOptions: Options[];
  onUpdateOptions?: (options: Options[]) => void;
  requestCode: string;
}

const MeterEquipmentList = ({
  data,
  updateData,
  options = {},
  meterEquipmentOptions,
  onUpdateOptions,
  requestCode
}: MeterEquipmentListProps) => {
  const {
    showCardCollapse = true,
    showAddButton = true,
    showDeleteAllButton = true,
    showActionColumn = true,
    isReadOnly = false,
  } = options;

  const itemMeterEquipment: S318EquipmentServiceData = {
    isUpdate: true,
    isEdited: false,
  } as S318EquipmentServiceData

  const [meterEquipments, setMeterEquipments] = useState<S318EquipmentServiceData[]>([]);
  const screenSize = useAppSelector((state) => state.screen_size);

  const [openModal, setOpenModal] = React.useState(false);
  const [updateIndex, setUpdateIndex] = React.useState(-1);

  useEffect(() => {
    let serviceSpecData = data.serviceSpecificData as S318ServiceData;
    setMeterEquipments(serviceSpecData?.equipments || [])
  }, [data.serviceSpecificData, meterEquipmentOptions]);

  useEffect(() => {
    if (screenSize !== DESKTOP_SCREEN) {
      const newMeterEquipments: S318EquipmentServiceData[] = meterEquipments.map(
        (item) => {
          return { ...item, isUpdate: false };
        }
      );
      setMeterEquipments(newMeterEquipments);
    }
  }, [screenSize]);

  const onRemoveData = (id: number | string) => {
    console.log("Remove equipment with id:", id);
  };

  const handleUpdateData = (items: S318EquipmentServiceData[]) => {
    setMeterEquipments(items);

    let newData = data;
    newData = {
      ...newData,
      serviceSpecificData: {
        ...newData.serviceSpecificData as S318ServiceData,
        equipments: items
      }
    };

    updateData?.(newData);
  };

  // Render content without CardCollapse
  const renderContent = () => {
    if (screenSize === DESKTOP_SCREEN) {
      return (
        <DataTableEditor
          columns={
            getColumns(
              meterEquipmentOptions,
              (o: Options[]) => onUpdateOptions?.(o)
            )
        }
          onUpdateData={handleUpdateData}
          visibleDelete={showDeleteAllButton && !isReadOnly}
          rowItem={itemMeterEquipment}
          realData={meterEquipments}
          LabelAddRow={
            showAddButton && !isReadOnly && screenSize === DESKTOP_SCREEN
              ? "เพิ่มมิเตอร์/อุปกรณ์ไฟฟ้า"
              : undefined
          }
          onRemoveData={onRemoveData}
          hiddenColumn={!showActionColumn && {action: false}}
        />
      );
    } else {
      return (
        <ListDataEditor
          onUpdateData={handleUpdateData}
          realData={meterEquipments}
        >
          {(pageData: S318EquipmentServiceData[], page, pageSize) => (
            <div>
              <ListDataContent
                pageData={pageData}
                realData={meterEquipments}
                page={page}
                pageSize={pageSize}
                onUpdateData={handleUpdateData}
                meterEquipmentOptions={meterEquipmentOptions}
                onRemoveData={onRemoveData}
                setUpdateIndex={(index) => {
                  setUpdateIndex(index);
                  setOpenModal(true);
                }}
                showActionButtons={showActionColumn && !isReadOnly}
                isReadOnly={isReadOnly}
                requestCode={requestCode}
              />

              {showAddButton && !isReadOnly && (
                <Button
                  className="pea-button-outline my-2 w-full"
                  onClick={() => {
                    setUpdateIndex(-1);
                    setOpenModal(true)
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  เพิ่มมิเตอร์/อุปกรณ์ไฟฟ้า
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
        <CardCollapse title={"มิเตอร์/อุปกรณ์ไฟฟ้า"}>{content}</CardCollapse>
      ) : (
        <Card className="p-4">
          <div>มิเตอร์/อุปกรณ์ไฟฟ้า</div>
          {content}
        </Card>
      )}

      {showAddButton && !isReadOnly && openModal && (
        <ModalEquipments
          open={openModal}
          onClose={() => setOpenModal(false)}
          index={updateIndex}
          options={meterEquipmentOptions}
          onUpdateOptions={onUpdateOptions}
          data={meterEquipments}
          onUpdateData={handleUpdateData}
          requestCode={requestCode}
        />
      )}
    </>
  );
};

export default MeterEquipmentList;
