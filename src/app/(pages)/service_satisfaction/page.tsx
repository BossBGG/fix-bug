"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/app/components/list/DataTable";
import ListData from "@/app/components/list/ListData";
import ListDataContent from "@/app/(pages)/service_satisfaction/list-data-content";
import { ColumnDef } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import InputSearch, { InputSearchRef } from "@/app/components/form/InputSearch";
import LatestUpdateData from "@/app/components/utils/LatestUpdateData";
import StarRating from "@/app/components/utils/StarRating";
import FilterDialog from "@/app/components/list/FilterDialog";
import FilterDialogContent from "@/app/(pages)/service_satisfaction/filter-dialog-content";
import { ServiceSatisfactionList } from "@/app/api/ServiceSatisfactionApi";
import { formatJSDateTH } from "@/app/helpers/DatetimeHelper";
import { SatisfactionData } from "@/types";
import { useRouter } from "next/navigation";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import ServiceSatisfactionBreadcrumb from "@/app/(pages)/service_satisfaction/breadcrumb";
import { useAppSelector } from "@/app/redux/hook";
import {
  DESKTOP_SCREEN,
  MOBILE_SCREEN,
} from "@/app/redux/slices/ScreenSizeSlice";
import {CustomTooltip} from "@/components/ui/custom-tooltip";

const initFilter = {
  startDate: undefined,
  endDate: undefined,
  rating: "",
  serviceType: "",
};

const ServiceSatisfactionPage = () => {
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [filters, setFilter] = useState(initFilter);
  const [listData, setListData] = useState<SatisfactionData[]>([]);
  const router = useRouter();
  const { setBreadcrumb } = useBreadcrumb();
  const screenSize = useAppSelector((state) => state.screen_size);
  const inputSearchRef = useRef<InputSearchRef>(null);

  useEffect(() => {
    setBreadcrumb(
      <ServiceSatisfactionBreadcrumb title="ผลประเมินความพึงพอใจในการให้บริการ" />
    );
  }, []);

  const clearFilter = () => {
    setSearchFilter("");
    inputSearchRef.current?.clearSearch();
    setFilter(initFilter);
  };

  const tableApiData = useMemo(() => {
    return { ...filters, search: searchFilter };
  }, [filters, searchFilter]);

  const columns: ColumnDef<SatisfactionData>[] = [
    {
      accessorKey: "index",
      header: "ลำดับที่",
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return (
          <div className="text-center">
            {pageIndex * pageSize + row.index + 1}
          </div>
        );
      },
      enableSorting: false,
      minSize: 40,
      maxSize: 40,
    },
    {
      accessorKey: "completedAt",
      id: "completedAt",
      header: "วันที่รายงาน",
      minSize: 95,
      maxSize: 120,
      cell: ({ row }) => {
        return (
          <div>
            <div>
              {formatJSDateTH(
                new Date(row.getValue("completedAt")),
                "dd MMMM yyyy"
              )}
            </div>
            <div className="text-[#4A4A4A]">
              {formatJSDateTH(
                new Date(row.getValue("completedAt")),
                "HH:mm น."
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "workOrderNumber",
      id: "workOrderNumber",
      header: "เลขที่ใบสั่งงาน",
      minSize: 150,
      maxSize: 150,
    },
    {
      accessorKey: "serviceRequestNumber",
      id: "serviceRequestNumber",
      header: "เลขที่คำร้อง",
      minSize: 150,
      maxSize: 150,
    },
    {
      accessorKey: "serviceType",
      id: "serviceType",
      header: "ประเภทงานบริการ",
      minSize: 250,
      maxSize: 250,
      cell: ({ row }) => (
        <div className="text-left">{row.original.serviceType || "-"}</div>
      ),
    },
    {
      accessorKey: "overallRating",
      id: "overallRating",
      header: "คะแนนรวม",
      cell: ({ row }) => <StarRating score={row.original.overallRating} />,
      minSize: 100,
      maxSize: 100,
    },
    {
      accessorKey: "action",
      header: "",
      enableSorting: false,
      minSize: 60,
      maxSize: 60,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <button
            className="bg-[#BEE2FF] rounded-sm px-2 py-1 cursor-pointer hover:bg-[#A0D8FF] transition-colors"
            onClick={() =>
              router.push(`/service_satisfaction/${row.original.id}`)
            }
          >
            <FontAwesomeIcon icon={faSearch} color="#03A9F4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-6">
      <LatestUpdateData />

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {screenSize === MOBILE_SCREEN && (
              <div className="text-xs mb-2">
                ค้นหาโดยเลขที่ใบสั่งงาน และเลขที่คำร้อง
              </div>
            )}
            <CustomTooltip fieldValue={searchFilter} fieldLabel="ค้นหาโดยเลขที่ใบสั่งงาน และเลขที่คำร้อง">
              <InputSearch
                handleSearch={setSearchFilter}
                placeholder={
                  screenSize !== MOBILE_SCREEN
                    ? "ค้นหาโดยเลขที่ใบสั่งงาน และเลขที่คำร้อง"
                    : ""
                }
                ref={inputSearchRef}
              />
            </CustomTooltip>
          </div>
          <FilterDialog>
            <FilterDialogContent
              clearFilter={clearFilter}
              filters={filters}
              submitSearch={setFilter}
            />
          </FilterDialog>
        </div>

        {screenSize !== DESKTOP_SCREEN ? (
          <ListData
            setListData={(data) => setListData(data as SatisfactionData[])}
            tableApi={ServiceSatisfactionList}
            tableApiData={tableApiData}
            visibleSizeSelection={false}
          >
            {listData.length > 0 ? (
              listData.map((item) => (
                <ListDataContent key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center text-[18px] text-gray-500 p-4">
                ไม่พบข้อมูลการประเมินความพึงพอใจ
              </div>
            )}
          </ListData>
        ) : (
          <DataTable
            columns={columns}
            tableApi={ServiceSatisfactionList}
            tableApiData={tableApiData}
            emptyData={
              <div className="text-center text-[18px] text-gray-500 p-4">
                ไม่พบข้อมูลการประเมินความพึงพอใจ
              </div>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default ServiceSatisfactionPage;