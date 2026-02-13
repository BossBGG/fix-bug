"use client";
import LatestUpdateData from "@/app/components/utils/LatestUpdateData";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { useEffect, useMemo, useRef, useState } from "react";
import SystemLogBreadcrumb from "@/app/(pages)/system_log/breadcrumb";
import { DataTable } from "@/app/components/list/DataTable";
import { columns } from "./columns";
import InputDateRange from "@/app/components/form/InputDateRange";
import InputSearch, { InputSearchRef } from "@/app/components/form/InputSearch";
import InputSelect from "@/app/components/form/InputSelect";
import { Options, SystemLogObj } from "@/types";
import { systemLogList } from "@/app/api/SystemLogApi";
import { DateRange } from "react-day-picker";
import { addMonths, subMonths } from "date-fns";
import * as React from "react";
import { useAppSelector } from "@/app/redux/hook";
import ListData from "@/app/components/list/ListData";
import ListDataContent from "@/app/(pages)/system_log/list-data-content";
import { EmpTyData } from "@/app/(pages)/system_log/empty-data";
import FilterDialog from "@/app/components/list/FilterDialog";
import ModalFilter from "@/app/layout/ModalFilter";
import { formatJSDate } from "@/app/helpers/DatetimeHelper";
import { DESKTOP_SCREEN } from "@/app/redux/slices/ScreenSizeSlice";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import { redirect } from "next/navigation";

const SystemLog = () => {
  const { setBreadcrumb } = useBreadcrumb();
  const user = useAppSelector((state) => state.user);

  if (user.type === "VENDOR_USER") {
    redirect("/ineligible");
  }
  const screenSize = useAppSelector((state) => state.screen_size);
  const [data, setData] = useState<SystemLogObj[]>([]);
  const [search_filter, setSearchFilter] = useState<string>("");
  const [type_filter, setTypeFilter] = useState<string | number>("all");
  const inputSearchRef = useRef<InputSearchRef>(null);
  const initDate: DateRange = {
    from: subMonths(new Date(), 1),
    to: addMonths(new Date(), 1),
  };
  const [date, setDate] = useState<DateRange | undefined>(initDate);

  const initFilterDate = {
    from: formatJSDate(initDate.from as Date, "yyyy-MM-dd"),
    to: formatJSDate(initDate.to as Date, "yyyy-MM-dd"),
  };
  const [filters, setFilters] = useState({
    ...initFilterDate,
    type: "all",
  });

  useEffect(() => {
    setBreadcrumb(<SystemLogBreadcrumb />);
    const d: SystemLogObj[] = [];

    setData(d);
  }, [setBreadcrumb]);

  const clearFilter = () => {
    inputSearchRef.current?.clearSearch();
    setSearchFilter("");
    setTypeFilter("all");
    setDate(initDate);
    setFilters({
      ...initFilterDate,
      type: "all",
    });
  };

  const submitSearch = () => {
    const filter_item = {
      from: date?.from ? formatJSDate(date.from, "yyyy-MM-dd") : "",
      to: date?.to ? formatJSDate(date.to, "yyyy-MM-dd") : "",
      type: type_filter as string,
    };

    setFilters(filter_item);
  };

  const tableApiData = useMemo(() => {
    const items: {
      from: string;
      to: string;
      search: string;
      type?: string;
    } = { from: filters.from, to: filters.to, search: search_filter };

    if (type_filter !== "all") {
      items.type = type_filter as string;
    }

    return items;
  }, [filters, search_filter]);

  //backend set ไว้ให้ filter แค่นี้ SUCCESS, ERROR, WARN, CREATED, UPDATED, DELETED, INFO
  const typeOptions: Options[] = [
    { value: "all", label: "ทั้งหมด" },
    { value: "ERROR", label: "Error" },
    { value: "INFO", label: "Info" },
    { value: "WARN", label: "Warning" },
    // {value: 'critical', label: 'Critical'},
    // {value: 'debug', label: 'Debug'},
    // {value: 'notice', label: 'Notice'},
    { value: "SUCCESS", label: "Success" },
    // {value: 'caution', label: 'Caution'},
    { value: "CREATED", label: "Created" },
    { value: "UPDATED", label: "Updated" },
    { value: "DELETED", label: "Deleted" },
  ];

  return (
    <div>
      <LatestUpdateData />

      <div className="border-1 border-[#E1D2FF] rounded-[20px] p-4">
        <div className="flex items-center mb-3">
          <CustomTooltip 
            fieldValue={search_filter}
            fieldLabel="ค้นหา"
          >
            <InputSearch
              handleSearch={setSearchFilter}
              ref={inputSearchRef}
            />
          </CustomTooltip>

          <FilterDialog>
            <ModalFilter
              title={"ตัวกรอง"}
              clearFilter={clearFilter}
              submitSearch={() => submitSearch()}
            >
              <CustomTooltip 
                fieldValue={date?.from && date?.to ? `${date.from.toLocaleDateString('th-TH')} - ${date.to.toLocaleDateString('th-TH')}` : ''}
                fieldLabel="วันที่"
              >
                <InputDateRange setData={setDate} data={date} />
              </CustomTooltip>
              <CustomTooltip 
                fieldValue={typeOptions.find(opt => opt.value === type_filter)?.label}
                fieldLabel="ประเภท"
              >
                <InputSelect
                  label="ประเภท"
                  placeholder="ประเภท"
                  options={typeOptions}
                  setData={setTypeFilter}
                  value={type_filter as string}
                />
              </CustomTooltip>
            </ModalFilter>
          </FilterDialog>
        </div>

        {screenSize === DESKTOP_SCREEN ? (
          <DataTable
            columns={columns}
            tableApi={systemLogList}
            tableApiData={tableApiData}
            emptyData={<EmpTyData />}
          />
        ) : (
          <div>
            <ListData
              setListData={(data) => setData(data as SystemLogObj[])}
              tableApi={systemLogList}
              tableApiData={tableApiData}
              visibleSizeSelection={true}
            >
              {data?.length > 0 ? (
                data.map((item, index) => (
                  <ListDataContent
                    item={item}
                    key={index}
                    screenSize={screenSize}
                  />
                ))
              ) : (
                <EmpTyData />
              )}
            </ListData>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLog;
