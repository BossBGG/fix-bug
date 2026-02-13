"use client";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import React, { useEffect, useState } from "react";
import AddMaterialEquipmentBreadcrumb from "@/app/(pages)/material_equipment/[id]/breadcrumb";
import InputText from "@/app/components/form/InputText";
import { Button } from "@/components/ui/button";
import {
  createDataMaterials,
  MaterialEquipmentListById,
  getMaterialOptions,
  updateDataMaterials,
} from "@/app/api/MaterialEquipmentApi";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/app/redux/hook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { MaterialEquipmentObj, MaterialOptionObj, Options } from "@/types";
import { EmpTyData } from "@/app/(pages)/material_equipment/empty-data";
import { DataTableEditor } from "@/app/components/editor-table/DataTableEditor";
import { ListDataEditor } from "@/app/components/editor-table/ListDataEditor";
import ListDataContent from "@/app/(pages)/material_equipment/[id]/list-data-content";
import {
  dismissAlert,
  showError,
  showProgress,
  showSuccess,
} from "@/app/helpers/Alert";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ModalAddOrEditMaterials from "@/app/(pages)/material_equipment/[id]/modal-add-or-edit-materials";
import { getColumns } from "@/app/(pages)/material_equipment/[id]/columns";
import { sort } from "next/dist/build/webpack/loaders/css-loader/src/utils";
import {
  DESKTOP_SCREEN,
  MOBILE_SCREEN,
} from "@/app/redux/slices/ScreenSizeSlice";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { useOfflineMaterialEquipmentForm } from "@/components/offline/OfflineMaterialEquipmentForm";

export interface addMaterialType {
  name: string;
  code: string;
  quantity: number;
  unit: string;
  isActive: boolean;
}

export interface updateMaterialType {
  id: number;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  isActive: boolean;
}

const CreateMaterialEquipment = () => {
  const { setBreadcrumb } = useBreadcrumb();
  const params = useParams();
  const screenSize = useAppSelector((state) => state.screen_size);
  const isCreate = params.id === "create";
  const { saveMaterialEquipment, isSaving: isOfflineSaving, isOnline } = useOfflineMaterialEquipmentForm();
  const itemMaterial: MaterialEquipmentObj = {
    id: 0,
    uuid: "",
    code: "",
    name: "",
    quantity: 0,
    unit: "",
    isActive: true,
    isUpdate: true,
    isEdited: false,
  };

  const [materialData, setMaterialData] = useState<MaterialEquipmentObj[]>([]);
  const [name, setName] = useState<string>("");
  const [removeIds, setRemoveIds] = useState<number[]>([]);
  const router = useRouter();
  const [openModal, setOpenModal] = React.useState(false);
  const [updateIndex, setUpdateIndex] = React.useState(-1);
  const [materialCodeOptions, setMaterialCodeOptions] = React.useState<
    Options[]
  >([]);
  const [materialNameOptions, setMaterialNameOptions] = React.useState<
    Options[]
  >([]);
  const [materialOriginal, setMaterialOriginal] = React.useState<
    MaterialOptionObj[]
  >([]);
  const [searching, setSearching] = React.useState(false);

  type MaterialOptionsResponse = {
    original: MaterialOptionObj[];
    code_options: Options[];
    name_options: Options[];
  };

  useEffect(() => {
    setBreadcrumb(<AddMaterialEquipmentBreadcrumb />);
    showProgress();
    Promise.all([
      fetchMaterialOptions(),
      !isCreate ? fetchListData() : Promise.resolve([] as MaterialOptionObj[]),
    ]).then(([resOptions, resMaterials]) => {
      //เพิ่ม options value ที่เคยเลือกไว้ เข้าไปใน options ที่ fetch มาแบบมี limit
      let materials = (resMaterials as MaterialOptionObj[]) || [];
      if (materials.length > 0) {
        let response_options = resOptions as MaterialOptionsResponse;
        let material_original = response_options.original;
        let material_code = response_options.code_options;
        let material_name = response_options.name_options;
        materials.map((mat) => {
          let inOption = response_options.original.find(
            (ori) => ori.id === mat.id
          );
          if (!inOption) {
            material_original = [...material_original, mat];
            material_code = [
              ...material_code,
              { value: mat.code, label: mat.code, data: mat },
            ];
            material_name = [
              ...material_name,
              { value: mat.name, label: mat.name, data: mat },
            ];
          }
        });
        setMaterialOriginal(material_original);
        setMaterialCodeOptions(material_code);
        setMaterialNameOptions(material_name);
      }
      dismissAlert();
    });
  }, [setBreadcrumb]);

  const fetchMaterialOptions = async (search: string = "") => {
    setSearching(true);
    const resp = await getMaterialOptions(search);
    if (resp.data?.status_code === 200) {
      const code_options: Options[] = [];
      const name_options: Options[] = [];
      const material_original_data: MaterialOptionObj[] = resp.data.data || [];
      setMaterialOriginal(material_original_data);

      material_original_data.map((item) => {
        code_options.push({ value: item.code, label: item.code, data: item });
        name_options.push({ value: item.name, label: item.name, data: item });
      });

      setMaterialCodeOptions(code_options);
      setMaterialNameOptions(name_options);
      setSearching(false);
      return {
        original: material_original_data,
        code_options,
        name_options,
      };
    }
    setSearching(false);
    return [];
  };

  const columns = getColumns(
    materialCodeOptions,
    materialNameOptions,
    materialOriginal
  );

  const fetchListData = async () => {
    const res = await MaterialEquipmentListById(params.id as string);
    if (res.data?.status_code === 200) {
      const material_equip = res.data?.data?.materialAndEquipment || [];
      setMaterialData(material_equip);
      setName(res.data?.data?.name || "");
      return material_equip;
    } else {
      showError(res.data?.message || "");
      return [];
    }
  };

  const addEquipment = () => {
    if (screenSize === MOBILE_SCREEN) {
      setOpenModal(true);
    } else {
      const newData = [...materialData, itemMaterial];
      setMaterialData(newData);
    }
  };

  const onRemoveData = (id: number) => {
    setRemoveIds((old) => [...old, id]);
    console.log("ids >>>> ", removeIds);
  };

  const validateMaterialData = () => {
    for (let i = 0; i < materialData.length; i++) {
      const item = materialData[i];
      const quantity =
        typeof item.quantity === "string"
          ? parseInt(item.quantity)
          : item.quantity;
      if (!item.code || !item.name) {
        showError("กรุณากรอกข้อมูลวัสดุและอุปกรณ์ให้ครบถ้วน");
        return false;
      }
      if (!item.quantity || quantity <= 0) {
        showError("กรุณากรอกจํานวนวัสดุและอุปกรณ์ให้ถูกต้อง");
        return false;
      }
    }
    return true;
  };

  const submit = () => {
    if (!name) {
      showError("กรุณาตั้งชื่อกลุ่มวัสดุและอุปกรณ์");
      return;
    }

    if (materialData?.length === 0) {
      showError("กรุณาเพิ่มอุปกรณ์");
      return;
    }

    if (!validateMaterialData()) return;

    showProgress();
    if (isCreate) {
      submitCreate();
    } else {
      submitUpdate();
    }
  };

  const resSuccess = () => {
    showSuccess().then(() => {
      router.push("/material_equipment");
    });
  };

  const submitCreate = async () => {
    const newMaterialData: addMaterialType[] = [];

    materialData.map((equipment) => {
      newMaterialData.push({
        name: equipment.name,
        code: equipment.code,
        quantity:
          typeof equipment.quantity === "string"
            ? parseInt(equipment.quantity)
            : equipment.quantity,
        unit: equipment.unit,
        isActive: true,
      });
    });

    const data = {
      name,
      isActive: true,
      materialAndEquipment: newMaterialData,
    };

    const result = await saveMaterialEquipment(data, { isEdit: false });
    
    if (result.success) {
      dismissAlert();
      router.push("/material_equipment");
    }
  };

  const submitUpdate = async () => {
    const addMaterials: addMaterialType[] = [];
    const updateMaterials: updateMaterialType[] = [];
    materialData.map((item) => {
      if (!item.id) {
        addMaterials.push({
          name: item.name,
          code: item.code,
          quantity:
            typeof item.quantity === "string"
              ? parseInt(item.quantity)
              : item.quantity,
          unit: item.unit,
          isActive: true,
        });
      } else if (item.id && item.isEdited) {
        updateMaterials.push({
          id: item.id,
          name: item.name,
          code: item.code,
          quantity:
            typeof item.quantity === "string"
              ? parseInt(item.quantity)
              : item.quantity,
          unit: item.unit,
          isActive: true,
        });
      }
    });

    const data = {
      name,
      addMaterials,
      updateMaterials,
      removeMaterialIds: removeIds,
    };

    const result = await saveMaterialEquipment(data, { 
      isEdit: true, 
      materialEquipmentId: params.id as string 
    });
    
    if (result.success) {
      dismissAlert();
      router.push("/material_equipment");
    }
  };

  return (
    <div className="border-1 border-[#E1D2FF] rounded-[20px] p-4">
      <div
        className={cn(
          "mb-4",
          screenSize !== DESKTOP_SCREEN
            ? "flex flex-wrap md:flex-nowrap items-end w-full"
            : "w-full"
        )}
      >
        <CustomTooltip 
          fieldValue={name}
          fieldLabel="ชื่อกลุ่ม"
        >
          <InputText
            label="ชื่อกลุ่ม"
            isRequired={true}
            placeholder="ตั้งชื่อกลุ่ม"
            onChange={setName}
            value={name}
          />
        </CustomTooltip>

        <Button
          className={cn(
            "mx-0 md:mx-3 pea-button w-full mt-3 md:mt-0 md:w-auto !px-3 !py-5",
            screenSize === DESKTOP_SCREEN && "hidden"
          )}
          onClick={() => addEquipment()}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          เพิ่มอุปกรณ์
        </Button>

        <ModalAddOrEditMaterials
          open={openModal}
          onClose={() => setOpenModal(false)}
          materialCodeOptions={materialCodeOptions}
          materialNameOptions={materialNameOptions}
          materialOriginalOptions={materialOriginal}
          data={materialData}
          onUpdate={setMaterialData}
          index={updateIndex}
          setUpdateIndex={setUpdateIndex}
        />
      </div>

      {screenSize !== DESKTOP_SCREEN ? (
        materialData.length > 0 ? (
          <ListDataEditor
            onUpdateData={setMaterialData}
            realData={materialData}
          >
            {(pageData: MaterialEquipmentObj[], page, pageSize) => (
              <ListDataContent
                pageData={pageData}
                realData={materialData}
                page={page}
                pageSize={pageSize}
                onUpdateData={setMaterialData}
                materialCodeOptions={materialCodeOptions}
                materialNameOptions={materialNameOptions}
                materialOriginalOptions={materialOriginal}
                onRemoveData={onRemoveData}
                setUpdateIndex={(index) => {
                  setUpdateIndex(index);
                  setOpenModal(true);
                }}
              />
            )}
          </ListDataEditor>
        ) : (
          <EmpTyData />
        )
      ) : (
        <DataTableEditor
          columns={columns}
          onUpdateData={setMaterialData}
          rowItem={itemMaterial}
          LabelAddRow={
            screenSize === DESKTOP_SCREEN ? "เพิ่มอุปกรณ์" : undefined
          }
          realData={materialData}
          onRemoveData={onRemoveData}
        />
      )}

      <div className="flex justify-between mt-4 md:flex-row flex-wrap-reverse">
        <Link
          className="cancel-button w-full md:w-auto !h-[43px] text-center"
          href="/material_equipment"
        >
          ยกเลิก
        </Link>
        <Button
          className="!py-[20px] pea-button w-full md:w-auto md:mb-0 mb-4"
          onClick={() => submit()}
        >
          บันทึก
        </Button>
      </div>
    </div>
  );
};

export default CreateMaterialEquipment;
