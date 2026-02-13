"use client";

import * as React from "react";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {Options} from "@/types";
import {ChevronDown, ChevronUp} from "lucide-react";
import InputSearch from "@/app/components/form/InputSearch";
import {useCallback, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";

interface CheckBoxGroupOfPeaOfficeProps {
  options: Options[],
  setData: (d: string[]) => void,
  showSelected?: boolean
  searchable?: boolean
  selectedValue?: string[];
  disabled?: boolean;
}

export default function InputGroupCheckbox({
                                             options,
                                             setData,
                                             showSelected = true,
                                             searchable = true,
                                             selectedValue,
                                             disabled = false
                                           }: CheckBoxGroupOfPeaOfficeProps) {
  const [selected, setSelected] = React.useState<string[]>(selectedValue || []);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState<string>("");
  const [modifyOptions, setModifyOptions] = React.useState<Options[]>(options);

  useEffect(() => {
    if (selectedValue !== undefined) {
      setSelected(selectedValue);
    }
  }, [selectedValue]);

  const toggleExpand = (value: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  const toggleOption = (option: Options, checked: boolean) => {
    const collectValues = (opt: Options): string[] => {
      if (opt.subOptions) {
        return [...opt.subOptions.flatMap(collectValues)];
      }
      return [opt.value.toString()];
    };

    const values = collectValues(option);
    setSelected((prev) => {
      if (checked) {
        let newValue = Array.from(new Set([...prev, ...values]));
        setData(newValue);
        return newValue;
      } else {
        let newValue = prev.filter((val) => !values.includes(val));
        setData(newValue || []);
        return newValue;
      }
    });
  };

  const filterOptionsRecursive = (options: Options[], searchTerm: string): Options[] => {
    if (!searchTerm) return options;

    const searchLowerCase = searchTerm.toLowerCase();

    return options.reduce<Options[]>((acc, option) => {
      const matchesParent = option.label.toLowerCase().includes(searchLowerCase);

      if (matchesParent) {
        acc.push(option);
      } else if (option.subOptions) {
        const filteredSubOptions = filterOptionsRecursive(option.subOptions, searchTerm);
        if (filteredSubOptions.length > 0) {
          acc.push({
            ...option,
            subOptions: filteredSubOptions
          });
        }
      }

      return acc;
    }, []);
  };

  const expandAllMatched = (options: Options[], searchTerm: string): Set<string> => {
    const expandedSet = new Set<string>();
    const searchLowerCase = searchTerm.toLowerCase();

    const traverse = (opts: Options[]) => {
      opts.forEach(option => {
        if (option.subOptions && option.subOptions.length > 0) {
          const hasMatch = option.label.toLowerCase().includes(searchLowerCase) ||
            option.subOptions.some(sub =>
              sub.label.toLowerCase().includes(searchLowerCase) ||
              (sub.subOptions && sub.subOptions.some(child =>
                child.label.toLowerCase().includes(searchLowerCase)
              ))
            );

          if (hasMatch) {
            expandedSet.add(option.value.toString());
          }

          traverse(option.subOptions);
        }
      });
    };

    traverse(options);
    return expandedSet;
  };

  const onSearch = useCallback((s: string) => {
    setSearch(s)
    if (s === '') {
      setModifyOptions(options);
      setExpanded(new Set());
      return;
    }

    const filtered = filterOptionsRecursive(options, s);
    const expandedItems = expandAllMatched(filtered, s);

    setModifyOptions(filtered);
    setExpanded(expandedItems);
  }, [options])

  const getCheckedState = (option: Options): boolean | "indeterminate" => {
    if (!option.subOptions) {
      return selected.includes(option.value.toString());
    }else if(option.subOptions && option.subOptions.length === 0) {
      return selected.includes(option.value.toString());
    }

    const subValues = option.subOptions?.map(getCheckedState);

    if (subValues?.every((v) => v === true)) return true; //sub option ถูกเลือกทุกตัว
    if (subValues?.some((v) => v === true || v === "indeterminate"))
      return "indeterminate"; //sub option ถูกเลือกแค่บางตัว
    return false; //sub option ไม่ถูกเลือกเลย
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return <span>{text}</span>;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} className="bg-yellow-300">{part}</span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  /** render tree */
  const renderTree = (option: Options, level = 0) => {
    const checkedState = getCheckedState(option);
    const isExpanded = expanded.has(option.value?.toString());

    return (
      <div key={option.value}>
        <div className={`flex items-center justify-between ${level !== 0 ? 'space-y-2' : 'space-y-1'}`}>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={
                checkedState === true
                  ? true
                  : checkedState === "indeterminate"
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={(checked) =>
                !disabled && toggleOption(option, checked === true)
              }
              disabled={disabled}
              className="border-[#9538EA] data-[state=checked]:border-none data-[state=checked]:bg-[#9538EA] cursor-pointer"
            />
            {highlightText(option.label, search)}
          </div>

          {option.subOptions && option.subOptions.length > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-pointer"
              onClick={() => !disabled && toggleExpand(option.value.toString())}
              disabled={disabled}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4"/>
              ) : (
                <ChevronDown className="h-4 w-4"/>
              )}
            </Button>
          ) : (
            <div className="w-6"/>
          )}
        </div>

        {isExpanded && option.subOptions && (
          <div
            className={`pl-6 pt-3 ${level === 0 ? 'bg-[#F2F2F2]' : ''} ${level === 1 ? 'flex items-center flex-wrap bg-[#E0E0E0]' : ''}`}>
            {option.subOptions.map((sub) => renderTree(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center my-2">
        {
          showSelected && selected?.length > 0 &&
          selected.map((sel, index) =>
            <div className="bg-[#E4DCFF] px-2 py-1 rounded-sm text-[14px] mr-2 font-bold mb-1"
                 key={`select-${index}-${sel}`}
            >
              {sel}
              <FontAwesomeIcon icon={faXmark} className="ml-1"/>
            </div>
          )
        }
      </div>

      {
        searchable &&
        <div className="my-3">
          <InputSearch handleSearch={onSearch}/>
        </div>
      }

      {
        modifyOptions.length > 0
          ? (modifyOptions.map((opt) => renderTree(opt)))
          : (<div className="text-center py-4 text-gray-500">ไม่พบข้อมูล</div>)
      }
    </div>
  )
}
