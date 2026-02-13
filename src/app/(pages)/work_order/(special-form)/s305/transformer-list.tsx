import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {DataTableEditor} from "@/app/components/editor-table/DataTableEditor";
import {getColumns} from "@/app/(pages)/work_order/(special-form)/s305/columns";
import {useAppSelector} from "@/app/redux/hook";
import {
  Options,
  S305ServiceData,
  S305TransformerServiceData,
  Transformer,
  TransformerMaterialEquipmentObj,
  WorkOrderObj
} from "@/types";
import {ListDataEditor} from "@/app/components/editor-table/ListDataEditor";
import ListDataContent from "@/app/(pages)/work_order/(special-form)/s305/list-data-content";
import {Button} from "@/components/ui/button";
import ModalTransformer from "@/app/(pages)/work_order/(special-form)/s305/modal-transformer";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import {
  mapTransformerBrandOptions,
  mapTransformerPhaseOptions, mapTransformerSizeOptions, mapTransformerTypeOptions, mapTransformerVoltageOptions
} from "@/app/(pages)/work_order/create_or_update/mapOptions";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface TransformerListOptions {
  showCardCollapse?: boolean;
  showAddButton?: boolean;
  showDeleteAllButton?: boolean;
  showActionColumn?: boolean;
  isReadOnly?: boolean;
}

interface TransformerListProps {
  data: WorkOrderObj;
  updateData?: (d: WorkOrderObj) => void;
  options?: TransformerListOptions;
  brandOptions: Options[]
  onUpdateBrandOptions: (options: Options[]) => void;
  phaseOptions: Options[]
  onUpdatePhaseOptions: (options: Options[]) => void;
  typeOptions: Options[]
  onUpdateTypeOptions: (options: Options[]) => void;
  sizeOptions: Options[]
  onUpdateSizeOptions: (options: Options[]) => void;
  voltageOptions: Options[]
  onUpdateVoltageOptions: (options: Options[]) => void;
  reqCode: string
}

const TransformerList = ({
                           data,
                           updateData,
                           options = {},
                           brandOptions,
                           onUpdateBrandOptions,
                           phaseOptions,
                           onUpdatePhaseOptions,
                           typeOptions,
                           onUpdateTypeOptions,
                           sizeOptions,
                           onUpdateSizeOptions,
                           voltageOptions,
                           onUpdateVoltageOptions,
                           reqCode
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
  } as S305TransformerServiceData;

  const [transformers, setTransformers] = useState<S305TransformerServiceData[]>([]);
  const screenSize = useAppSelector((state) => state.screen_size);
  const [openModal, setOpenModal] = React.useState(false);
  const [editData, setEditData] = React.useState<S305TransformerServiceData | null>(null);
  const [updateIndex, setUpdateIndex] = React.useState(-1);

  /*useEffect(() => {
    const fetchMapData = async () => {
      if(typeof data.requestServiceDetail === 'object' && data.requestServiceDetail?.items) {
        const reqService = data.requestServiceDetail.items as Transformer[];
        const newBrandOptions = await mapTransformerBrandOptions(reqService, brandOptions, reqCode)
        onUpdateBrandOptions(newBrandOptions)
        const newPhaseOptions = await mapTransformerPhaseOptions(reqService, phaseOptions, reqCode)
        onUpdatePhaseOptions(newPhaseOptions)
        const newTypeOptions = await mapTransformerTypeOptions(reqService, typeOptions, reqCode)
        onUpdateTypeOptions(newTypeOptions)
        const newSizeOptions = await mapTransformerSizeOptions(reqService, sizeOptions, reqCode)
        onUpdateSizeOptions(newSizeOptions)
        const newVoltageOptions = await mapTransformerVoltageOptions(reqService, voltageOptions, reqCode)
        onUpdateVoltageOptions(newVoltageOptions)
      }
    }

    if(transformers.length === 0
      && typeof data.requestServiceDetail === 'object'
      && data.requestServiceDetail?.items.length > 0) {
      fetchMapData()
    }
  }, [data.requestServiceDetail]);*/

  useEffect(() => {
    let serviceSpecData = data.serviceSpecificData as S305ServiceData
    setTransformers(serviceSpecData?.transformers || [])
  }, [data.serviceSpecificData]);

  useEffect(() => {
    if (screenSize !== DESKTOP_SCREEN) {
      const newTransformers: S305TransformerServiceData[] = transformers.map((item) => {
        return {...item, isUpdate: false};
      });

      console.log("newTransformers >>> ", newTransformers);
      setTransformers(newTransformers);
    }
  }, [screenSize]);

  const onRemoveData = (id: number) => {
    console.log("Remove equipment with id:", id);
  };

  const handleUpdateData = (transformer: S305TransformerServiceData[]) => {
    console.log('transformer >>> ', transformer);
    let serviceSpecData = data.serviceSpecificData as S305ServiceData
    let newData: WorkOrderObj = {
      ...data,
      serviceSpecificData: {
        ...serviceSpecData,
        transformers: transformer
      }
    }

    updateData?.(newData)
  };

  // ฟังก์ชันสำหรับเพิ่มอุปกรณ์จาก modal
  const handleAddTransformer = (transformer: S305TransformerServiceData) => {
    let newTransformers: S305TransformerServiceData[] = transformers;
    if(updateIndex > -1) {
      newTransformers[updateIndex] = transformer;
    }else {
      newTransformers.push(transformer);
    }

    handleUpdateData(newTransformers);
  };

  // Render content without CardCollapse
  const renderContent = () => {
    if (screenSize === DESKTOP_SCREEN) {
      return (
        <DataTableEditor
          columns={
            getColumns(
              brandOptions,
              onUpdateBrandOptions,
              phaseOptions,
              onUpdatePhaseOptions,
              typeOptions,
              onUpdateTypeOptions,
              sizeOptions,
              onUpdateSizeOptions,
              voltageOptions,
              onUpdateVoltageOptions,
              reqCode
            )
          }
          onUpdateData={handleUpdateData}
          visibleDelete={showDeleteAllButton}
          rowItem={itemTransformer}
          realData={transformers}
          LabelAddRow={showAddButton && screenSize === DESKTOP_SCREEN ? "เพิ่มหม้อแปลง" : undefined}
          onRemoveData={onRemoveData}
          hiddenColumn={!showActionColumn && {action: false}}
        />
      );
    } else {
      return (
        <ListDataEditor onUpdateData={handleUpdateData} realData={transformers}>
          {(pageData: S305TransformerServiceData[], page, pageSize) => (
            <div>
              <ListDataContent
                pageData={pageData}
                realData={transformers}
                page={page}
                pageSize={pageSize}
                onUpdateData={handleUpdateData}
                brandOptions={brandOptions}
                phaseOptions={phaseOptions}
                typeOptions={typeOptions}
                sizeOptions={sizeOptions}
                voltageOptions={voltageOptions}
                onRemoveData={onRemoveData}
                setUpdateIndex={(index) => {
                  setUpdateIndex(index);
                  setEditData(transformers[index])
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
        <CardCollapse title={"รายละเอียดหม้อแปลง"}>{content}</CardCollapse>
      ) : (
        content
      )}

      {showAddButton && (
        <ModalTransformer
          open={openModal}
          onClose={() => {
            setOpenModal(false)
            setUpdateIndex(-1);
            setEditData(null)
          }}
          onAddTransformer={handleAddTransformer}
          onEditTransformer={handleAddTransformer}
          editData={editData}
          brandOptions={brandOptions}
          onUpdateBrandOptions={onUpdateBrandOptions}
          phaseOptions={phaseOptions}
          onUpdatePhaseOptions={onUpdatePhaseOptions}
          typeOptions={typeOptions}
          onUpdateTypeOptions={onUpdateTypeOptions}
          sizeOptions={sizeOptions}
          onUpdateSizeOptions={onUpdateSizeOptions}
          voltageOptions={voltageOptions}
          onUpdateVoltageOptions={onUpdateVoltageOptions}
          reqCode={reqCode}
        />
        )}
    </>
  );
};

export default TransformerList;
