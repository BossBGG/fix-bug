import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {DataTableEditor} from "@/app/components/editor-table/DataTableEditor";
import {columns} from "@/app/(pages)/work_order/(special-form)/s315/columns";
import {useAppSelector} from "@/app/redux/hook";
import {
  S315ServiceData,
  S315TransformerServiceData,
  TransFormerS315,
  WorkOrderObj
} from "@/types";
import {ListDataEditor} from "@/app/components/editor-table/ListDataEditor";
import ListDataContent from "@/app/(pages)/work_order/(special-form)/s315/list-data-content";
import {Button} from "@/components/ui/button";
import ModalAddOrEditTransFormer from "@/app/(pages)/work_order/(special-form)/s315/modal-equipments";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
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
  updateData: (data: WorkOrderObj) => void;
  options?: ElectricalListOptions;
}

const ElectricalList = ({
                          data,
                          updateData,
                          options = {}
                        }: ElectricalListProps) => {
  // Default options
  const {
    showCardCollapse = true,
    showAddButton = true,
    showDeleteAllButton = true,
    showActionColumn = true,
    isReadOnly = false
  } = options;

  const itemTransFormer = {
    isUpdate: true,
    isEdited: false
  } as S315TransformerServiceData;

  const [transformers, setTransFormer] = useState<S315TransformerServiceData[]>([])
  const screenSize = useAppSelector(state => state.screen_size)

  const [openModal, setOpenModal] = React.useState(false);
  const [updateIndex, setUpdateIndex] = React.useState(-1);
  const [editData, setEditData] = React.useState<S315TransformerServiceData>()

  useEffect(() => {
    let serviceSpecData = data.serviceSpecificData as S315ServiceData
    setTransFormer(serviceSpecData?.transformers || [])
  }, [data.serviceSpecificData]);

  useEffect(() => {
    if (screenSize !== DESKTOP_SCREEN) {
      const newTransFormer: S315TransformerServiceData[] = transformers.map((item) => {
        return {...item, isUpdate: false};
      })

      setTransFormer(newTransFormer)
    }
  }, [screenSize]);

  const onRemoveData = (id: number) => {
    console.log('Remove transformer with id:', id);
  }

  const handleUpdateData = (d: S315TransformerServiceData[]) => {
    setTransFormer(d)
    updateDataByTransFromer(d)
  }

  const handleAddTransFormer = (d: S315TransformerServiceData) => {
    let serviceSpec = data.serviceSpecificData as S315ServiceData
    let transformers: S315TransformerServiceData[] = serviceSpec?.transformers || []
    transformers.push(d)
    updateDataByTransFromer(transformers)
  }

  const handleUpdateTransFormer = (d: S315TransformerServiceData) => {
    let newTransFormer: S315TransformerServiceData[] = [...transformers]
    newTransFormer[updateIndex] = d;
    updateDataByTransFromer(newTransFormer)
  }

  const updateDataByTransFromer = (transformers: S315TransformerServiceData[]) => {
    let serviceSpecData = data.serviceSpecificData as S315ServiceData
    let newData = {
      ...data,
      serviceSpecificData: {
        ...serviceSpecData,
        transformers: transformers,
      }
    }

    updateData(newData)
  }

  const renderContent = () => {
    if (screenSize === DESKTOP_SCREEN) {
      return (
        <DataTableEditor
          columns={columns}
          onUpdateData={handleUpdateData}
          visibleDelete={showDeleteAllButton && !isReadOnly}
          rowItem={itemTransFormer}
          realData={transformers}
          LabelAddRow={
            showAddButton && !isReadOnly && screenSize === DESKTOP_SCREEN
              ? 'เพิ่มหม้อแปลง'
              : undefined
          }
          onRemoveData={onRemoveData}
          hiddenColumn={!showActionColumn && {action: false}}
        />
      );
    } else {
      return (
        <ListDataEditor
          realData={transformers}
        >
          {(pageData: S315TransformerServiceData[], page, pageSize) => (
            <div>
              <ListDataContent
                pageData={pageData}
                realData={transformers}
                page={page}
                pageSize={pageSize}
                onUpdateData={handleUpdateData}
                onRemoveData={onRemoveData}
                setUpdateIndex={(index) => {
                  setUpdateIndex(index)
                  setEditData(transformers[index])
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
        <CardCollapse title={'หม้อแปลง'}>
          {content}
        </CardCollapse>
      ) : (
        content
      )}


      {showAddButton && !isReadOnly && (
        <ModalAddOrEditTransFormer
          open={openModal}
          onClose={() => {
            setOpenModal(false)
            setUpdateIndex(-1)
            setEditData(undefined)
          }}
          editData={editData}
          onAddTransFormer={handleAddTransFormer}
          onUpdateTransFormer={handleUpdateTransFormer}
        />
      )}
    </>
  )
}

export default ElectricalList;
