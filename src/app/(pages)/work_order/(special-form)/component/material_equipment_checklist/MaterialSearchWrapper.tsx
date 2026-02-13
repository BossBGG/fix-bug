import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Options, MaterialSet, MaterialMaster } from "@/types";
import {
  getMaterialSets,
  getMaterialMaster,
} from "@/app/api/MaterialEquipmentApi";
import InputSearchSelect from "@/app/components/form/InputSearchSelect";
import InputSearch from "@/app/components/form/InputSearch";
import debounce from "lodash/debounce";

interface MaterialSearchWrapperProps {
  type: "sets" | "search";
  value: string;
  placeholder: string;
  label: string;
  onChange: (value: string, setName?: string) => void;
  disabled?: boolean;
  office?: string;
}

const MaterialSearchWrapper = ({
  type,
  value,
  placeholder,
  label,
  onChange,
  disabled = false,
  office,
}: MaterialSearchWrapperProps) => {
  const [options, setOptions] = useState<Options[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMaterialSets = useCallback(async (search: string = "") => {
    if (search.trim().length > 0 && search.trim().length < 3) {
      return;
    }

    setLoading(true);
    try {

      const response = await getMaterialSets(search, office);

      if (response.status === 200 && response.data.data) {
        const materialSets = response.data.data.items;


        materialSets.forEach((set: MaterialSet) => {
          const materials = set.materialAndEquipment as any[];
        });

        const formattedOptions: Options[] = materialSets.map(
          (set: MaterialSet) => ({
            label: set.name,
            value: set.uuid,
            data: set,
          })
        );

        setOptions(formattedOptions);
      }
    } catch (error) {
      console.error("Error fetching material sets:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [office]);

  const fetchMaterialMaster = useCallback(async (search: string = "") => {
    if (!search.trim() || search.trim().length < 3) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getMaterialMaster(search);
      if (response.status === 200 && response.data.data) {
        const materials = response.data.data;
        const formattedOptions: Options[] = materials.map(
          (material: MaterialMaster) => ({
            label: `${material.code} - ${material.name}`,
            value: material.code,
            data: material,
          })
        );
        setOptions(formattedOptions);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearchMaster = useMemo(
    () =>
      debounce((search: string) => {
        fetchMaterialMaster(search);
      }, 500),
    [fetchMaterialMaster]
  );

  useEffect(() => {
    if (type === "sets") {
      fetchMaterialSets("");
    }
  }, [type, office]); // Remove fetchMaterialSets from deps to prevent infinite loop

  useEffect(() => {
    return () => {
      debouncedSearchMaster.cancel();
    };
  }, [debouncedSearchMaster]);

  const handleSearch = useCallback(
    (search: string) => {
      onChange(search);

      if (type === "search") {
        debouncedSearchMaster(search);
      }
    },
    [onChange, type, debouncedSearchMaster]
  );

  const handleSelectChange = useCallback(
    (selectedValue: string) => {

      const selectedOption = options.find(opt => opt.value === selectedValue);
      const setName = selectedOption?.label || "";
      onChange(selectedValue, setName);
    },
    [onChange, options]
  );

  if (disabled) {
    return (
      <div className="mb-3">
        {label && <div className="mb-2 text-sm font-medium">{label}</div>}
        <div className="w-full h-[45px] px-3 py-2 border rounded-md bg-gray-100 text-gray-500 flex items-center">
          {type === "sets"
            ? value
              ? options.find((opt) => opt.value === value)?.label || value
              : placeholder
            : value || placeholder}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      {label && <div className="mb-2 text-sm font-medium">{label}</div>}

      {type === "sets" ? (
        <InputSearchSelect
          selectOptions={options}
          fetchOptions={fetchMaterialSets}
          onChange={handleSelectChange}
          loading={loading}
          value={value}
          placeholder={placeholder}
        />
      ) : (
        <InputSearch
          handleSearch={handleSearch}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default MaterialSearchWrapper;
