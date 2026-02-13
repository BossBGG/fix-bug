"use client";
import React, {useCallback, useEffect, useState} from "react";
import {Options} from "@/types";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";

interface SelectionProps {
  value: string;
  options: Options[];
  placeholder: string;
  onUpdate?: (value: string, item: any) => void;
  onSearch?: (s: string) => Promise<Options[]>;
  onUpdateOptions?: (d: Options[]) => void,
  disabled?: boolean;
}

export const Selection = ({
                            value,
                            options,
                            placeholder,
                            onUpdate,
                            onSearch,
                            onUpdateOptions,
                            disabled=false
                          }: SelectionProps) => {
  const [selectedOption, setSelectedOption] = useState<Options | null>(
    options.find((opt) => opt.value == value) || null
  );
  const [defaultOptions, setDefaultOptions] = useState<Options[]>(options);

  useEffect(() => {
    if (value) {
      const current = {value: value, label: value};
      setSelectedOption(
        options.find((opt) => opt.value == value) || current
      );
    }
    setDefaultOptions(options);
  }, [value, options]);

  const handleChange = useCallback(
    (option: Options | null) => {
      console.log('handleChange', option);
      setSelectedOption(option);
      if (option) {
        if (onUpdate) onUpdate(option.value as string, option?.data);
        if (onUpdateOptions) {
          let inOption = options.find((opt) => opt.value == option.value);
          if (!inOption) {
            options.push(option);
            onUpdateOptions(options)
          }
        }
      }
    },
    [onUpdate]
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

  const fontSize = 14;
  const customStyles = {
    menuPortal: (base: any) => ({...base, zIndex: 9999}),
    input: (provided: any) => ({
      ...provided,
      height: 33,
      borderColor: '#DFE4EA'
    }),
    /*control: (provided: any) => ({
      ...provided,
      fontSize
    }),
    input: (provided: any) => ({
      ...provided,
      fontSize
    }),
    singleValue: (provided: any) => ({
      ...provided,
      fontSize
    }),
    option: (provided: any) => ({
      ...provided,
      fontSize
    }),*/
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={options}
      loadOptions={loadOptions}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      menuShouldScrollIntoView={true}
      menuShouldBlockScroll={false}
      menuPortalTarget={null}
      backspaceRemovesValue={false}
      blurInputOnSelect={false}
      styles={customStyles}
      isDisabled={disabled}
    />
  );
};
