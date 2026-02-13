"use client";
import InputSelect from "@/app/components/form/InputSelect";
import InputDateRange from "@/app/components/form/InputDateRange";
import { Options } from "@/types";
import { useEffect, useState } from "react";
import ModalFilter from "@/app/layout/ModalFilter";
import { DateRange } from "react-day-picker";
import { getServiceTypeOptions } from "@/app/api/WorkOrderOptions";
import { dismissAlert, showProgress } from "@/app/helpers/Alert";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

const FilterDialogContent = ({
  clearFilter,
  submitSearch,
  filters,
}: {
  clearFilter: () => void;
  submitSearch: (filters: any) => void;
  filters: {
    startDate: Date | undefined;
    endDate: Date | undefined;
    rating: string;
    serviceType: string;
  };
}) => {
  const scoreOptions: Options[] = [
    { value: "all", label: "ทั้งหมด" },
    { value: "5", label: "5 ดาว" },
    { value: "4", label: "4 ดาว" },
    { value: "3", label: "3 ดาว" },
    { value: "2", label: "2 ดาว" },
    { value: "1", label: "1 ดาว" },
  ];

  const initDate: DateRange = {
    from: undefined,
    to: undefined,
  };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initDate);
  const [serviceType, setServiceType] = useState<string>("");
  const [serviceTypeOptions, setServiceTypeOptions] = useState<Options[]>([]);
  const [score_filter, setScore] = useState<string | number>("");

  useEffect(() => {
    setServiceType(filters.serviceType || "");
    setScore(filters.rating || "");
    setDateRange({
      from: filters.startDate || undefined,
      to: filters.endDate || undefined,
    });
  }, [filters]);

  useEffect(() => {
    fetchServiceTypeOptions();
  }, []);

  const fetchServiceTypeOptions = async () => {
    showProgress();
    const resp = await getServiceTypeOptions().finally(dismissAlert);
    if (resp.status === 200 && resp.data.data && resp.data.data.serviceGroups) {
      let options: Options[] = [];
      resp.data.data.serviceGroups.map((item) => {
        let option: Options = {
          value: item.id,
          label: item.name,
        };

        options.push(option);
      });

      setServiceTypeOptions(options);
    } else {
      setServiceTypeOptions([]);
    }
  };

  const handleClearFilter = () => {
    setDateRange(initDate);
    setServiceType("");
    setScore("");
    clearFilter();
  };

  const handleSubmitSearch = () => {
    submitSearch({
      startDate: dateRange?.from,
      endDate: dateRange?.to,
      serviceType,
      rating: score_filter,
    });
  };

  return (
    <div>
      <ModalFilter
        title={"ตัวกรอง"}
        clearFilter={handleClearFilter}
        submitSearch={handleSubmitSearch}
      >
        <div className="space-y-4">
          <CustomTooltip 
            fieldValue={dateRange?.from && dateRange?.to ? `${dateRange.from.toLocaleDateString('th-TH')} - ${dateRange.to.toLocaleDateString('th-TH')}` : ''}
            fieldLabel="วันที่"
          >
            <InputDateRange
              label="วันที่"
              data={dateRange}
              setData={setDateRange}
            />
          </CustomTooltip>

          <CustomTooltip 
            fieldValue={serviceTypeOptions.find(opt => opt.value === serviceType)?.label}
            fieldLabel="ประเภทงานบริการ"
          >
            <InputSelect
              options={serviceTypeOptions}
              label="ประเภทงานบริการ"
              placeholder="เลือกประเภทงานบริการ"
              value={serviceType}
              setData={(v) => setServiceType(v as string)}
            />
          </CustomTooltip>

          <CustomTooltip 
            fieldValue={scoreOptions.find(opt => opt.value === score_filter)?.label}
            fieldLabel="คะแนนรวม"
          >
            <InputSelect
              options={scoreOptions}
              label="คะแนนรวม"
              placeholder="เลือกคะแนน"
              value={score_filter as string}
              setData={(v) => setScore(v)}
            />
          </CustomTooltip>
        </div>
      </ModalFilter>
    </div>
  );
};

export default FilterDialogContent;
