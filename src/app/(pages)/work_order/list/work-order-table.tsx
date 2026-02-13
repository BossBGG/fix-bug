import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faFile,
  faFileImport,
  faPencil,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/ui/card";
import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { DataTable } from "@/app/components/list/DataTable";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import {Options, SubServiceType, WorkOrderDashBoardSummary, WorkOrderObj} from "@/types";
import {
  completeWorkBulk,
  completeWorkByWorkOrderNo,
  WorkOrderList,
  WorkOrderListByOffice,
  VendorWorkOrderList,
} from "@/app/api/WorkOrderApi";
import { useAppSelector } from "@/app/redux/hook";

import Link from "next/link";
import {
  ConfirmCompleteWork,
  CompleteWork,
  FailedCompleteWork,
} from "@/components/ui/popup";
import {showError, showProgress, showSuccess, dismissAlert} from "@/app/helpers/Alert";
import {renderStatusWorkOrder} from "@/app/(pages)/work_order/[id]/work-order-status";
import {useOnlineStatus} from "@/hooks/useOnlineStatus";
import {offlineSyncService} from "@/services/offlineSync";
import {DESKTOP_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";
import ListData, {ListDataRef} from "@/app/components/list/ListData";
import ListDataContent from "@/app/(pages)/work_order/list/list-data-content";
import {cn} from "@/lib/utils";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";

const getColumns = (
  onCheck: (checked: boolean, val: string) => void,
  selected: string[],
  handleSelectAll: (check: boolean) => void,
  isSelectAll: boolean
): ColumnDef<WorkOrderObj>[] => {
  const getPathEditWorkOrder = (
    status: string,
    row: Row<WorkOrderObj>,
    requestCode: string
  ) => {
    let params = new URLSearchParams({
      id: row.original.id as string,
      requestCode: requestCode as string,
    });

    if (status === "W") {
      params.append("isEdit", "true");
      return `/work_order/create_or_update?${params.toString()}`;
    } else {
      //O,K,B,J,T,X,Y,Z
      params.append("isExecute", "true");
      return `/work_order/create_or_update?${params.toString()}`;
    }
  };

  return [
    {
      accessorKey: "id",
      meta: {
        headerClassName: "text-center pr-0",
      },
      header: () => (
        <div
          className="w-5 h-5 border-2 border-[#9538EA] rounded-sm bg-white cursor-pointer flex items-center justify-center"
          onClick={() => handleSelectAll(!isSelectAll)}
          style={{
            backgroundColor: isSelectAll ? "#9538EA" : "white",
          }}
        >
          {isSelectAll && (
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center">
            <Checkbox
              key={row.id}
              checked={selected.includes(row.original.workOrderNo as string)}
              onCheckedChange={(check: boolean) =>
                onCheck(check, row.original.workOrderNo as string)
              }
              className="border-[#9538EA] data-[state=checked]:border-none data-[state=checked]:bg-[#9538EA] cursor-pointer"
              disabled={row.original.statusCode !== "K"}
            />
          </div>
        );
      },
      enableSorting: false,
      minSize: 30,
      maxSize: 30,
    },
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
      accessorKey: "customerRequestNo",
      header: "เลขที่คำร้อง",
      cell: ({ row }) => {
        return row.original.customerRequestNo || "-";
      },
      minSize: 110,
      maxSize: 110,
    },
    {
      accessorKey: "workOrderNo",
      header: "เลขที่ใบสั่งงาน",
      minSize: 110,
      maxSize: 110,
    },
    {
      accessorKey: "customerName",
      header: "ชื่อลูกค้า",
      minSize: 120,
      maxSize: 120,
      cell: ({ row }) => {
        return (
          <div className="text-wrap">{row.original.customerName || "-"}</div>
        );
      },
    },
    {
      accessorKey: "serviceType",
      header: "ประเภทคำร้อง",
      cell: ({ row }) => {
        return (
          <div className="text-wrap">{row.original.serviceType || "-"}</div>
        );
      },
    },
    {
      accessorKey: "appointmentDate",
      header: "วันที่ปฏิบัติงาน",
      cell: ({ row }) => {
        return (
          <div className="text-wrap">
            {row.original.appointmentDate ? formatJSDateTH(new Date(row.original.appointmentDate), 'dd MMMM yyyy') : '-'}
          </div>
        );
      },
      minSize: 90,
      maxSize: 90,
    },
    {
      accessorKey: "statusCode",
      header: "สถานะ",
      cell: ({ row }) => {
        return (
          <div className="text-wrap">
            {renderStatusWorkOrder(row.original.statusCode) || "-"}
          </div>
        );
      },
      minSize: 90,
      maxSize: 90,
    },
    {
      accessorKey: "workType",
      header: "ประเภทงาน",
      minSize: 90,
      maxSize: 90,
      cell: ({ row }) => {
        return (
          <div
            className={cn(
              `rounded-full text-center px-3 py-2 font-medium text-[12px]`,
              row.original.workCategory &&
                row.original.workCategory.toLowerCase() === "survey"
                ? "bg-[#FDE5B6] text-[#E67C00]"
                : "bg-[#E1D2FF] text-[#6C4AB6]"
            )}
          >
            {row.original.workCategory &&
            row.original.workCategory.toLowerCase() === "survey"
              ? "งานสำรวจ"
              : "งานปฏิบัติงาน"}
          </div>
        );
      },
    },
    {
      accessorKey: "workOrderType",
      header: "ประเภทใบสั่งงาน",
      minSize: 90,
      maxSize: 90,
      cell: ({ row }) => {
        return row.original.workOrderType === "sub"
          ? "ใบสั่งงานย่อย"
          : "ใบสั่งงานหลัก";
      },
    },
    {
      accessorKey: "action",
      header: "",
      enableSorting: false,
      minSize: 50,
      maxSize: 80,
      cell: ({ row }) => {
        if (row.original.requestCode) {
          const requestCode = row.original.requestCode?.toLowerCase();
          const status = row.original.statusCode;
          let editPath = "";
          let viewModePath = `/work_order/${row.original.id}`;

          if (
            row.original.workCategory &&
            row.original.workCategory.toLowerCase() === "survey"
          ) {
            viewModePath = `/survey/${row.original.id}/view`;
            editPath = `/survey/${row.original.id}`;
          } else {
            editPath = getPathEditWorkOrder(status, row, requestCode);
          }

          return (
            <div className="flex items-center gap-2">
              <Link
                className="bg-[#BEE2FF] rounded-sm px-2 py-1 mr-2"
                href={viewModePath}
              >
                <FontAwesomeIcon icon={faFile} color="#03A9F4" />
              </Link>

              {row.original.statusCode !== "M" && (
                <Link
                  href={editPath}
                  className="bg-[#FDE5B6] rounded-sm px-2 py-1"
                >
                  <FontAwesomeIcon icon={faPencil} color="#F9AC12" />
                </Link>
              )}
            </div>
          );
        }

        return "";
      },
    },
  ];
};

type WorkOrderTableProps = {
  viewMode: "SELF" | "ALL";
  filterStatus: string;
  filterSearch: string;
  updateCountWorkOrder: (count: number) => void,
  callbackData: (d: WorkOrderDashBoardSummary | undefined) => void,
};

const EmptyData = () => (
  <div className="text-center text-[18px] text-gray-500 p-4">
    ไม่พบรายการใบสั่งงาน
  </div>
);

const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
                                                         viewMode,
                                                         filterStatus,
                                                         filterSearch,
                                                         updateCountWorkOrder,
                                                         callbackData
                                                       }) => {
  const user = useAppSelector((state) => state.user);
  const [selected, setSelected] = useState<string[]>([]);
  const dataTableRef = useRef<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [messageCompleteWork, setMessageCompleteWork] = useState("");
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false)
  const screenSize = useAppSelector((state) => state.screen_size);
  const [listWorkOrder, setListWorkOrder] = useState<WorkOrderObj[]>([]);
  const listDataRef = useRef<ListDataRef>(null);
  const { isOnline } = useOnlineStatus();

  const handleSelectAll = (checked: boolean) => {
    if (checked && dataTableRef.current) {
      const rows = dataTableRef.current.getRowModel().rows;
      let allIds: string[] = [];
      rows.map((row: any) => {
        if (row.original.statusCode === "K") {
          allIds.push(row.original.workOrderNo);
        }
      });
      setSelected(allIds);
      setIsSelectAll(allIds.length > 0);
      if (allIds.length === 0) {
        showError("ไม่มีใบสั่งงานที่สามารถปิดงานได้");
      }
    } else {
      setSelected([]);
      setIsSelectAll(false);
    }
  };

  const handleSelectAllList = (checked: boolean) => {
    if (checked && listWorkOrder?.length > 0) {
      let allIds: string[] = [];
      listWorkOrder.map((item: WorkOrderObj) => {
        if (item.statusCode === "K") {
          allIds.push(item.workOrderNo);
        }
      });
      setSelected(allIds);
      setIsSelectAll(allIds.length > 0);
      if (allIds.length === 0) {
        showError("ไม่มีใบสั่งงานที่สามารถปิดงานได้");
      }
    } else {
      setSelected([]);
      setIsSelectAll(false);
    }
  };

  const onCheckWorkOrder = (checked: boolean, value: string) => {
    if (checked) {
      setSelected((prev) => [...prev, value]);
    } else {
      setSelected(selected.filter((sel) => sel !== value));
    }
  };

  const onComplete = () => {

    if (selected.length === 0) {
      showError("กรุณาเลือกใบสั่งงานที่ต้องการปิดงาน");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    showProgress();
    
    try {
      if (isOnline) {
        const res = await completeWorkBulk(selected);
        dismissAlert();
        
        if (res.data.status_code === 200 && res.data.data) {
          setMessageCompleteWork(res.data.message);
          if (res.data.data.failedCount > 0) {
            setShowFailed(true);
          } else {
            setShowSuccess(true);
          }
        } else {
          setShowFailed(true);
        }
      } else {
        await offlineSyncService.saveCompleteWorkOrderOffline(selected, true);
        dismissAlert();
        setMessageCompleteWork(`บันทึกการปิดงาน ${selected.length} รายการในโหมดออฟไลน์สำเร็จ ข้อมูลจะถูกซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต`);
        setShowSuccess(true);
      }
    } catch (error) {
      dismissAlert();
      setShowFailed(true);
    } finally {
      setSelected([]);
      setIsSelectAll(false);
    }
  };

  const tableApiData = useMemo(() => {
    return {
      status: filterStatus,
      search: filterSearch,
      view: viewMode.toLowerCase()
    }
  }, [viewMode, filterSearch, filterStatus])

  return (
    <Card className="p-4">
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">
              โหมดออฟไลน์: ข้อมูลจะถูกบันทึกและซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต
            </span>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap justify-between items-center gap-2">
        {screenSize !== DESKTOP_SCREEN ? (
          <div className="flex items-center gap-3">
            <Checkbox
              id="all"
              className="border-[#9538EA] data-[state=checked]:border-none data-[state=checked]:bg-[#9538EA]"
              onCheckedChange={handleSelectAllList}
            />
            <Label htmlFor="all">เลือกทั้งหมด</Label>
          </div>
        ) : (
          <div></div>
        )}

        <div className="flex flex-wrap flex-end gap-2">
          <button
            className="bg-[#298267] rounded-full p-3 text-white cursor-pointer md:w-auto w-full"
            onClick={onComplete}
          >
            ปิดใบงาน
          </button>

          <button className="pea-button-outline md:w-auto w-full">
            <FontAwesomeIcon icon={faFileImport} className="mr-2" />
            ส่งออกเอกสาร
          </button>
        </div>
      </div>

      <div>
        {screenSize === DESKTOP_SCREEN ? (
          <DataTable
            ref={dataTableRef}
            columns={getColumns(
              (checked: boolean, val: string) => onCheckWorkOrder(checked, val),
              selected,
              handleSelectAll,
              isSelectAll
            )}
            tableApi={
              viewMode === "ALL"
                ? WorkOrderListByOffice(user.selectedPeaOffice)
                : user.type === 'VENDOR_USER'
                  ? VendorWorkOrderList
                  : WorkOrderList
            }
            tableApiData={tableApiData}
            emptyData={<EmptyData />}
            getTotalCount={updateCountWorkOrder}
            callbackData={(d: any) => callbackData(d)}
            // showLoading={false}
          />
        ) : (
          <ListData
            setListData={(data) => setListWorkOrder(data as WorkOrderObj[])}
            tableApi={
              viewMode === "ALL"
                ? WorkOrderListByOffice(user.selectedPeaOffice)
                : user.type === 'VENDOR_USER'
                  ? VendorWorkOrderList
                  : WorkOrderList
            }
            tableApiData={tableApiData}
            getTotalCount={updateCountWorkOrder}
            ref={listDataRef}
            callbackData={(d: any) => callbackData(d)}
          >
            {listWorkOrder.length > 0 ? (
              listWorkOrder.map((item) => (
                <ListDataContent
                  key={item.id}
                  item={item}
                  selected={selected}
                  onCheck={onCheckWorkOrder}
                />
              ))
            ) : (
              <EmptyData />
            )}
          </ListData>
        )}
      </div>

      <ConfirmCompleteWork
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        count={selected.length}
      />
      <CompleteWork
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          listDataRef.current?.fetchListData();
          (dataTableRef?.current as any)?.options?.meta?.refreshData?.();
        }}
        message={messageCompleteWork}
      />
      <FailedCompleteWork
        open={showFailed}
        onClose={() => setShowFailed(false)}
        message={messageCompleteWork}
      />
    </Card>
  );
};

export default WorkOrderTable;
