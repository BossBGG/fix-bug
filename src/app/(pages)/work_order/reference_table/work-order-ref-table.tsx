import React, {useEffect, useMemo, useState} from "react";
import {DataTable} from "@/app/components/list/DataTable";
import {ColumnDef} from "@tanstack/react-table";
import {ServiceRequest, WorkOrderCreateItem} from "@/types";
import {WorkOrderRefListApi} from "@/app/api/WorkOrderApi";
import {useAppDispatch} from "@/app/redux/hook";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faPlus} from "@fortawesome/free-solid-svg-icons";
import {renderStatusWorkOrder} from "@/app/(pages)/work_order/[id]/work-order-status";
import {format} from "date-fns"
import {th} from "date-fns/locale"
import {setCustomerRequestData} from "@/app/redux/slices/CustomerRequestSlice";
import debounce from "lodash/debounce";

const renderColumns = (
  setSelected: (item: ServiceRequest) => void,
  workOrderId: string | null,
): ColumnDef<ServiceRequest>[] => {
  return [
    {
      accessorKey: "id",
      header: "#",
      cell: ({row}) => {
        const isSelected = workOrderId == row.getValue("id")
        return <Button
          className={`text-[14px] text-white cursor-pointer ${isSelected ? 'bg-[#F9AC12] hover:bg-[#F9AC12]' : 'bg-[#671FAB] hover:bg-[#671FAB]'}`}
          size="sm"
          onClick={() => setSelected(row.original)}>
          {isSelected ? <FontAwesomeIcon icon={faCheck}/> : <FontAwesomeIcon icon={faPlus}/>}
          เลือก
        </Button>
      },
      maxSize: 80,
      enableSorting: false
    },
    {
      accessorKey: "workOrderNo",
      header: "เลขที่ใบสั่งงานหลัก",
      cell: ({row}) => row.getValue('workOrderNo'),
      maxSize: 135,
    },
    {
      accessorKey: "customerRequestNo",
      header: "เลขที่คำร้อง",
      cell: ({row}) => row.getValue('customerRequestNo') || "-",
      maxSize: 120,
    },
    {
      accessorKey: "customerName",
      header: "ชื่อลูกค้า",
      cell: ({row}) => (
        <div className="whitespace-pre-wrap">{row.getValue('customerName') || "-"}</div>
      ),
      maxSize: 180
    },
    {
      accessorKey: "statusCode",
      header: "สถานะคำร้อง",
      cell: ({row}) => (
        <div className="text-wrap">{renderStatusWorkOrder(row.getValue("statusCode"))}</div>
      ),
      maxSize: 150
    },
    {
      accessorKey: "serviceType",
      header: "ประเภทงานบริการ",
      cell: ({row}) => {
        return <div className="text-wrap">{row.getValue('serviceType')}</div>
      },
      maxSize: 150
    },
    {
      accessorKey: "createdAt",
      header: "วันที่รับคำร้อง",
      cell: ({row}) => {
        if (!row.getValue("createdAt")) return '-'
        return format(new Date(row.getValue('createdAt')), 'dd MMMM yyyy', {locale: th})
      },
      maxSize: 180
    }
  ]
}

const EmpTyData = (): React.ReactNode => {
  return <div className="flex flex-col justify-center items-center p-4">
    <div className="font-bold text-[24px] mt-5">ไม่พบรายการใบสั่งงาน</div>
  </div>
}

interface WorkOrderReferenceTableProps {
  data: WorkOrderCreateItem,
  updateData: (d: WorkOrderCreateItem) => void,
  search?: string,
  requestCodes: string[]
}

const WorkOrderReferenceTable: React.FC<WorkOrderReferenceTableProps> = ({
                                                                           data,
                                                                           updateData,
                                                                           search,
                                                                           requestCodes
                                                                         }) => {
  const [workOrderId, setWorkOrderId] = React.useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = debounce((value: string) => {
      setDebouncedSearch(value);
    }, 800);

    handler(search || "");

    return () => {
      handler.cancel();
    };
  }, [search]);

  const tableApiParams = useMemo(() => {

    if (requestCodes === undefined || requestCodes === null) {
      return undefined;
    }
    
    return {
      search: debouncedSearch,
      requestCodes: requestCodes.toString()
    };
  }, [debouncedSearch, requestCodes]);

  const handleUpdateData = (item: ServiceRequest) => {
    console.log('item >>> ', item)
    setWorkOrderId(item.id)
    updateData({
      ...data,
      serviceId: item.serviceId as string,
      requestCode: item.requestCode as string,
      workOrderParentId: item.id
    })

    item.workOrderParentId = item.id
    console.log('item.>>>> ', item)
    dispatch(setCustomerRequestData(item))
  }

  return (
    <DataTable columns={
      renderColumns(
        (service: ServiceRequest) => handleUpdateData(service),
        workOrderId
      )}
               tableApi={WorkOrderRefListApi}
               tableApiData={tableApiParams}
               emptyData={<EmpTyData/>}
               showLoading={false}
    />
  )
}

export default WorkOrderReferenceTable;
