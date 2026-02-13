"use client";
import React, {useCallback, useEffect, useState} from "react";
import {Options} from "@/types";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";
import {Row} from "@tanstack/react-table";

interface EditableSelectCellProps {
  columnValue: string;
  row: Row<any>;
  column: {
    id: string;
  };
  table: {
    options: {
      meta?: {
        updateData: (
          rowIndex: number,
          columnId: string,
          value: unknown
        ) => void;
      };
    };
  };
  options: Options[];
  placeholder: string;
  onUpdate?: (value: string | number, item: any) => void;
  onSearch?: (s: string) => Promise<Options[]>;
  keyOfLabel?: string,
  onUpdateOptions?: (d: Options[]) => void;
  disabled?: boolean
}

export const EditableSelectCell = ({
                                     columnValue,
                                     row,
                                     column,
                                     table,
                                     options,
                                     placeholder,
                                     onUpdate,
                                     onSearch,
                                     keyOfLabel = "name",
                                     onUpdateOptions,
                                     disabled = false
                                   }: EditableSelectCellProps) => {
  const [selectedOption, setSelectedOption] = useState<Options | null>(
    options.find((opt) => opt.value == columnValue) || null
  );
  const [defaultOptions, setDefaultOptions] = useState<Options[]>(options);

  useEffect(() => {
    if (columnValue) {
      const current = options.find((opt) => opt.value == columnValue);
      if (current) {
        setSelectedOption(current)
        setDefaultOptions(options);
      } else if (onSearch && onUpdateOptions) {
        // Load option ด้วย value ที่ส่งเข้ามา กรณีที่ไม่ตัวเลือก value ใน options
        onSearch(columnValue).then((result) => {
          const foundOption = result.find((opt) => opt.value == columnValue);
          if (foundOption) {
            setSelectedOption(foundOption);
            // อัพเดท options ด้วย
            const newOptions = [...options, ...result.filter(opt =>
              !options.find(existing => existing.value === opt.value)
            )];
            onUpdateOptions(newOptions);
            setDefaultOptions(newOptions);
          } else {
            setSelectedOption({value: columnValue, label: row.original[keyOfLabel] || columnValue});
            setDefaultOptions(options);
          }
        });
      } else {
        setSelectedOption({value: columnValue, label: row.original[keyOfLabel] || columnValue});
        setDefaultOptions(options);
      }
    }
  }, [columnValue, options]);

  const handleChange = useCallback(
    (option: Options | null) => {
      setSelectedOption(option);
      if (option) {
        table.options.meta?.updateData(row.index, column.id, option.value);
        if (onUpdate) onUpdate(option.value, option?.data);
        if (onUpdateOptions) {
          let inOption = options.find((opt) => opt.value === option.value);
          if (!inOption) {
            options.push(option);
            onUpdateOptions(options)
          }
        }
      }
    },
    [row.index, column.id, table, onUpdate]
  );

  const fetchOptions = (inputValue: string, callback: (options: Options[]) => void) => {
    if (!onSearch) {
      const filtered = options.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      callback(filtered);
    } else {
      onSearch(inputValue).then((result) => {
        let finalOptions = result.filter((opt) =>
          !selectedOption || opt.value !== selectedOption.value
        );

        if (!inputValue && selectedOption) {
          finalOptions = [selectedOption, ...finalOptions];
        }
        callback(finalOptions);
      });
    }
  };

  const debouncedFetcher = useCallback(
    debounce(fetchOptions, 300),
    [onSearch, selectedOption, options]
  );

  const loadOptions = (inputValue: string, callback: (options: Options[]) => void) => {
    const term = inputValue.trim();

    // ถ้าพิม 1-2 ตัวอักษร ให้คืนค่า defaultOptions ทันที ไม่ต้องรอดีเลย์
    // ผลลัพธ์: UI จะไม่ขึ้น Loading และ List จะไม่ถูกเปลี่ยน
    if (term.length > 0 && term.length < 3) {
      callback(defaultOptions);
      return;
    }

    // ถ้าไม่มีการพิม (เปิด Dropdown ครั้งแรก)
    if (term.length === 0) {
      callback(defaultOptions);
      return;
    }

    // ถ้าพิม 3 ตัวขึ้นไป ค่อยเรียกใช้ Debounced Function
    debouncedFetcher(inputValue, callback);
  };

  return (
    <div>
      <AsyncSelect
        cacheOptions
        defaultOptions={options}
        loadOptions={loadOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        menuShouldScrollIntoView={false}
        menuPortalTarget={document.body}
        backspaceRemovesValue={false}
        blurInputOnSelect={false}
        isDisabled={disabled}
      />
    </div>
  );
};
