import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {DataTableEditor} from "@/app/components/editor-table/DataTableEditor";
import {getColumnElectricalEditor} from "@/app/(pages)/work_order/(special-form)/s301/columns";
import {useAppSelector} from "@/app/redux/hook";
import {
  Options,
  RequestServiceDetail,
  RequestServiceItem, S301EquipmentServiceData, S301ServiceData,
  WorkOrderObj
} from "@/types";
import {ListDataEditor} from "@/app/components/editor-table/ListDataEditor";
import ListDataContent from "@/app/(pages)/work_order/(special-form)/s301/list-data-content";
import {Button} from "@/components/ui/button";
import ModalEquipments from "@/app/(pages)/work_order/(special-form)/s301/modal-equipments";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import {Card} from "@/components/ui/card";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface ElectricalListOptions {
  showCardCollapse?: boolean;
  showAddButton?: boolean;
  showDeleteAllButton?: boolean;
  showActionColumn?: boolean;
  isReadOnly?: boolean;
}

interface ElectricalListProps {
  data: WorkOrderObj;
  updateData?: (data: WorkOrderObj) => void;
  options?: ElectricalListOptions;
  serviceEquipmentOptions: Options[],
  onUpdateOptions?: (options: Options[]) => void;
  requestCode: string
}

const ElectricalList = ({
                          data,
                          updateData,
                          options = {},
                          serviceEquipmentOptions,
                          onUpdateOptions,
                          requestCode
                        }: ElectricalListProps) => {
  // Default options
  const {
    showCardCollapse = true,
    showAddButton = true,
    showDeleteAllButton = true,
    showActionColumn = true,
    isReadOnly = false
  } = options;

  const itemRequestService = {
    isUpdate: true,
    isEdited: false
  } as S301EquipmentServiceData;

  const [requestService, setRequestService] = useState<S301EquipmentServiceData[]>([]);
  const screenSize = useAppSelector(state => state.screen_size)

  const [openModal, setOpenModal] = React.useState(false);
  const [updateIndex, setUpdateIndex] = React.useState(-1);

  useEffect(() => {
    let serviceSpecData = data.serviceSpecificData as S301ServiceData
    setRequestService(serviceSpecData?.equipments || [])
  }, [data.serviceSpecificData]);

  const onRemoveData = (id: number | string) => {
    console.log('Remove equipment with id:', id);
  }

  const handleUpdateData = (items: S301EquipmentServiceData[]) => {
    let newData = data;
    newData = {
      ...newData,
      serviceSpecificData: {
        ...data.serviceSpecificData,
        equipments: items
      }
    }
    setRequestService(items)
    updateData?.(newData)
  }

  // Render content without CardCollapse
  const renderContent = () => {
    if (screenSize === DESKTOP_SCREEN) {
      return (
        <DataTableEditor
          columns={
          getColumnElectricalEditor(
            serviceEquipmentOptions,
            (d: Options[]) => onUpdateOptions?.(d),
            requestCode
          )}
          onUpdateData={handleUpdateData}
          visibleDelete={showDeleteAllButton && !isReadOnly} // เพิ่ม !isReadOnly
          rowItem={itemRequestService}
          realData={requestService}
          LabelAddRow={
            showAddButton && !isReadOnly && screenSize === DESKTOP_SCREEN
              ? 'เพิ่มประเภทอุปกรณ์ไฟฟ้า'
              : undefined
          }
          // classActionRow="absolute bottom-0 right-0"
          // classPagination="mt-3"
          onRemoveData={onRemoveData}
          hiddenColumn={ !showActionColumn ? { action: false } : {} }
        />
      );
    } else {
      return (
        <ListDataEditor
          onUpdateData={handleUpdateData}
          realData={requestService}
        >
          {(pageData: S301EquipmentServiceData[], page, pageSize) => (
            <div>
              <ListDataContent
                pageData={pageData}
                realData={requestService}
                page={page}
                pageSize={pageSize}
                onUpdateData={handleUpdateData}
                equipmentNameOptions={serviceEquipmentOptions}
                onRemoveData={onRemoveData}
                setUpdateIndex={(index) => {
                  setUpdateIndex(index)
                  setOpenModal(true)
                }}
                showActionButtons={showActionColumn && !isReadOnly} // เพิ่ม !isReadOnly
                isReadOnly={isReadOnly}
              />

              {/* แสดง Add Button เฉพาะเมื่อ showAddButton เป็น true และไม่ใช่ readOnly */}
              {showAddButton && !isReadOnly && (
                <Button
                  className="pea-button-outline my-2 w-full"
                  onClick={() => setOpenModal(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                  เพิ่มประเภทอุปกรณ์ไฟฟ้า
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
        <CardCollapse title={'ประเภทอุปกรณ์ไฟฟ้า'}>
          <div className="mb-12">
            {content}
          </div>
        </CardCollapse>
      ) : (
        <Card className="p-4">
         <div>ประเภทอุปกรณ์ไฟฟ้า</div>
          {content}
        </Card>
      )}


      {showAddButton && !isReadOnly && openModal && (
        <ModalEquipments
          open={openModal}
          onClose={() => {
            setUpdateIndex(-1)
            setOpenModal(false)
          }}
          updateIndex={updateIndex}
          options={serviceEquipmentOptions}
          onUpdateOptions={onUpdateOptions}
          data={requestService}
          onUpdateData={handleUpdateData}
          requestCode={requestCode}
        />
      )}
    </>
  )
}

export default ElectricalList;
