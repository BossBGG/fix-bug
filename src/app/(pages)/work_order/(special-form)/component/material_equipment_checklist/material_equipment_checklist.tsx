"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { columns } from "./columns";
import CardCollapse from "../CardCollapse";
import { DataTableEditor } from "@/app/components/editor-table/DataTableEditor";
import { MaterialEquipmentObj, Options, WorkOrderObj } from "@/types";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "@/app/redux/hook";
import { ListDataEditor } from "@/app/components/editor-table/ListDataEditor";
import MaterialEquipmentListContent from "./MaterialEquipmentListContent";
import AddMaterial from "./AddMaterial";
import { getMaterialMaster } from "@/app/api/MaterialEquipmentApi";
import { set } from "lodash";
import { DESKTOP_SCREEN } from "@/app/redux/slices/ScreenSizeSlice";

interface MaterialEquipmentOptions {
  showCardCollapse?: boolean;
  showAddButton?: boolean;
  showDeleteAllButton?: boolean;
  showActionColumn?: boolean;
  isReadOnly?: boolean;
}

interface MaterialEquipmentChecklistProps {
  options?: MaterialEquipmentOptions;
  data?: MaterialEquipmentObj[];
  updateData?: (data: MaterialEquipmentObj[]) => void;
  office?: string;
}

const MaterialEquipmentChecklistPage = forwardRef<
  { loadInitialMaterials: () => void },
  MaterialEquipmentChecklistProps
>(({ options = {}, data = [], updateData, office }, ref) => {
  const {
    showCardCollapse = true,
    showAddButton = true,
    showDeleteAllButton = true,
    showActionColumn = true,
    isReadOnly = false,
  } = options;

  const user = useAppSelector((state) => state.user);
  const customerRequest = useAppSelector(
    (state) => state.customer_request_data
  );
  const peaOfficeOptions = useAppSelector(
    (state) => state.options.peaOfficeOptions
  );

  const screenSize = useAppSelector((state) => state.screen_size);
  const [materialEquipments, setMaterialEquipments] =
    useState<MaterialEquipmentObj[]>(data);
  const [openModal, setOpenModal] = useState(false);
  const [updateIndex, setUpdateIndex] = useState(-1);

  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<MaterialEquipmentObj | null>(
    null
  );
  const [editingIndex, setEditingIndex] = useState(-1);

  const [materialOptions, setMaterialOptions] = useState<Options[]>([]);

  const userOffice = useMemo(() => {
    let resolvedOffice = "";

    if (office) {
      resolvedOffice = office;
    } else if (customerRequest?.peaOffice) {
      resolvedOffice = customerRequest.peaOffice;
    } else if (user?.selectedPeaOffice) {
      if (user.selectedPeaOffice.length <= 10) {
        resolvedOffice = user.selectedPeaOffice;
      } else {
        const found = peaOfficeOptions.find(
          (opt) =>
            opt.label === user.selectedPeaOffice ||
            opt.data?.peaNameFull === user.selectedPeaOffice
        );
        resolvedOffice = found?.data?.office || "";
      }
    }

    return resolvedOffice;
  }, [
    office,
    customerRequest?.peaOffice,
    user?.selectedPeaOffice,
    peaOfficeOptions,
  ]);

  const loadInitialMaterials = async () => {
    try {
      const response = await getMaterialMaster("");
      if (response.status === 200 && response.data.data) {
        const options = response.data.data.map((material) => ({
          label: `${material.code} - ${material.name}`,
          value: material.code,
          data: material,
        }));
        setMaterialOptions(options);
      }
    } catch (error) {
      console.error("Error loading materials:", error);
    }
  };

  useImperativeHandle(ref, () => ({
    loadInitialMaterials,
  }));

  useEffect(() => {
    loadInitialMaterials();
  }, []);

  useEffect(() => {
    if (data && data.length >= 0) {
      setMaterialEquipments(data);
    }
  }, [data]);

  useEffect(() => {
    if (materialEquipments.length > 0 && updateData) {
      updateData(materialEquipments);
    }
  }, [materialEquipments]);

  const handleUpdateData = (newData: MaterialEquipmentObj[]) => {
    setMaterialEquipments(newData);
    if (updateData) {
      updateData(newData);
    }
  };

  const onRemoveData = (id: number) => {
    console.log("Remove data with id:", id);
  };

  const handleAddMaterial = async (
    newMaterials: MaterialEquipmentObj | MaterialEquipmentObj[]
  ) => {
    const materialsArray = Array.isArray(newMaterials)
      ? newMaterials
      : [newMaterials];

    let updatedData = [...materialEquipments];

    const stockPromises = materialsArray.map(async (newMaterial) => {
      try {
        const resp = await getMaterialMaster(newMaterial.code);
        return {
          code: newMaterial.code,
          availableStock:
            resp.status === 200 && resp.data.data
              ? resp.data.data[0].availableStock
              : 0,
        };
      } catch (error) {
        console.error("Error getting material master:", error);
        return {
          code: newMaterial.code,
          availableStock: 0,
        };
      }
    });

    const stockResults = await Promise.all(stockPromises);

    const stockMap = new Map(
      stockResults.map((result) => [result.code, result.availableStock])
    );

    for (const newMaterial of materialsArray) {
      const existingMaterialIndex = updatedData.findIndex(
        (item) =>
          item.code === newMaterial.code && item.name === newMaterial.name
      );

      const availableStock = stockMap.get(newMaterial.code) || 0;

      if (existingMaterialIndex >= 0) {
        updatedData[existingMaterialIndex] = {
          ...updatedData[existingMaterialIndex],
          quantity: Number(newMaterial.quantity),
          availableStock: availableStock,
        };
      } else {
        updatedData.push({
          ...newMaterial,
          id: newMaterial.id || Date.now() + Math.random(),
          availableStock: availableStock,
          isUpdate: false,
          isEdited: false,
        });
      }
    }

    handleUpdateData(updatedData);
  };

  const handleDesktopAdd = () => {
    setEditMode(false);
    setEditingItem(null);
    setEditingIndex(-1);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditMode(false);
    setEditingItem(null);
    setEditingIndex(-1);
  };

  const renderContent = () => {
    if (screenSize === DESKTOP_SCREEN) {
      return (
        <div>
          <DataTableEditor
            columns={columns}
            onUpdateData={handleUpdateData}
            realData={materialEquipments}
            onRemoveData={onRemoveData}
            hiddenColumn={
              (!showActionColumn || isReadOnly) && { action: false }
            }
          />

          {showAddButton && !isReadOnly && (
            <div className="flex items-center justify-end mt-3">
              <Button
                className="pea-button !px-3 !py-4"
                onClick={() => setOpenModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                เพิ่มวัสดุอุปกรณ์
              </Button>

              <Button
                className="mx-2 pea-button-outline !px-3 !py-4"
                onClick={() => handleUpdateData([])}
              >
                <FontAwesomeIcon icon={faTrashCan} className="mr-2" />
                ลบทั้งหมด
              </Button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <ListDataEditor
          onUpdateData={handleUpdateData}
          realData={materialEquipments}
        >
          {(pageData: MaterialEquipmentObj[], page, pageSize) => (
            <div>
              <div className="overflow-x-hidden max-h-[500px]">
                <MaterialEquipmentListContent
                  pageData={pageData}
                  realData={materialEquipments}
                  page={page}
                  pageSize={pageSize}
                  onUpdateData={handleUpdateData}
                  materialOptions={materialOptions}
                  onRemoveData={onRemoveData}
                  setUpdateIndex={(index) => {
                    setUpdateIndex(index);
                    setOpenModal(true);
                  }}
                  showActionButtons={showActionColumn && !isReadOnly}
                  isReadOnly={isReadOnly}
                  office={userOffice}
                />
              </div>

              <div className="px-6 py-4 border-t flex-shrink-0">
                {showAddButton && !isReadOnly && (
                  <Button
                    className="pea-button-outline my-2 w-full"
                    onClick={() => setOpenModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    เพิ่มวัสดุอุปกรณ์
                  </Button>
                )}
              </div>
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
        <CardCollapse title={"รายการวัสดุอุปกรณ์"}>{content}</CardCollapse>
      ) : (
        content
      )}

      {showAddButton && !isReadOnly && openModal && (
        <AddMaterial
          open={openModal}
          onClose={handleModalClose}
          index={-1}
          onAddMaterial={handleAddMaterial}
          editMode={false}
          existingSelections={[]}
          office={userOffice}
          existingMaterials={materialEquipments}
        />
      )}
    </>
  );
});

MaterialEquipmentChecklistPage.displayName = "MaterialEquipmentChecklistPage";

export default MaterialEquipmentChecklistPage;
