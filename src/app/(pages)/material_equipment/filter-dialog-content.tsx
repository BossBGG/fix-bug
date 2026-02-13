"use client";
import InputSelect from "@/app/components/form/InputSelect";
import { Options } from "@/types";
import { useEffect, useState } from "react";
import ModalFilter from "@/app/layout/ModalFilter";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
const FilterDialogContent = ({
  clearFilter,
  submitSearch,
  status,
}: {
  clearFilter: () => void;
  submitSearch: (value: string) => void;
  status: string;
}) => {
  const statusOptions: Options[] = [
    { value: "all", label: "ทั้งหมด" },
    { value: "true", label: "เปิดใช้งาน" },
    { value: "false", label: "ปิดใช้งาน" },
  ];
  const [status_filter, setStatus] = useState<string | number>(
    status || statusOptions[0].value
  );

  useEffect(() => {
    setStatus(status);
  }, [status]);

  return (
    <div>
      <ModalFilter
        title={"ตัวกรอง"}
        clearFilter={clearFilter}
        submitSearch={() => submitSearch(status_filter as string)}
      >
        <CustomTooltip 
          fieldValue={statusOptions.find(opt => opt.value === status_filter)?.label}
          fieldLabel="สถานะ"
        >
          <InputSelect
            options={statusOptions}
            label="สถานะ"
            placeholder="สถานะ"
            value={status_filter as string}
            setData={(v) => setStatus(v)}
          />
        </CustomTooltip>
      </ModalFilter>
    </div>
  );
};

export default FilterDialogContent;
