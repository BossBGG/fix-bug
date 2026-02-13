import React, {useEffect, useMemo, useState} from "react";
import {DataTable} from "@/app/components/list/DataTable";
import {ColumnDef} from "@tanstack/react-table";
import {ServiceRequest, WorkOrderCreateItem} from "@/types";
import {ServiceRequestRefListApi} from "@/app/api/WorkOrderApi";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faPlus} from "@fortawesome/free-solid-svg-icons";
import {setCustomerRequestData} from "@/app/redux/slices/CustomerRequestSlice";
import {useAppDispatch} from "@/app/redux/hook";
import debounce from "lodash/debounce";

const renderColumns = (
  setSelected: (item: ServiceRequest) => void,
  selected: string | null
): ColumnDef<ServiceRequest>[] => [
  {
    accessorKey: "id",
    header: "#",
    cell: ({row}) => {
      const isSelected = selected === row.getValue("id")
      return <Button
        className={`text-[14px] text-white cursor-pointer ${isSelected ? 'bg-[#F9AC12] hover:bg-[#F9AC12]' : 'bg-[#671FAB] hover:bg-[#671FAB]'}`}
        size="sm"
        // onClick={() => setSelected(row.getValue("customerRequestNo"), row.original.serviceId, row.original.requestCode)}>
        onClick={() => setSelected(row.original)}>
        {isSelected ? <FontAwesomeIcon icon={faCheck}/> : <FontAwesomeIcon icon={faPlus}/>}
        เลือก
      </Button>
    },
    maxSize: 55,
    enableSorting: false
  },
  {
    accessorKey: "customerRequestNo",
    header: "เลขที่คำร้อง",
    cell: ({row}) => (
      <div className="text-wrap">
        {row.getValue('customerRequestNo')}
      </div>
    ),
    maxSize: 100,
  },
  {
    accessorKey: "customerName",
    header: "ชื่อลูกค้า",
    cell: ({row}) => (
      <div className="text-wrap">{row.getValue('customerName')}</div>
    ),
    maxSize: 120
  },
  {
    accessorKey: "serviceGroupName",
    header: "ประเภทงานบริการ",
    cell: ({row}) => {
      return <div className="text-wrap">
        {row.getValue('serviceGroupName')}
      </div>
    },
    maxSize: 120
  },
  {
    accessorKey: "createdDate",
    header: "วันที่รับคำร้อง",
    cell: ({row}) => {
      if (!row.getValue("createdDate")) return '-'
      return <div className="text-wrap">{formatJSDateTH(new Date(row.getValue('createdDate')), 'dd MMMM yyyy')}</div>
    },
    maxSize: 100
  }
]

const EmpTyData = (): React.ReactNode => {
  return <div className="flex flex-col justify-center items-center p-4">
    <div className="font-bold text-[24px] mt-5">ไม่พบรายการใบคำร้อง</div>
  </div>
}

interface ServiceRequestRef {
  data: WorkOrderCreateItem,
  updateData: (d: WorkOrderCreateItem) => void,
  search: string,
  requestCodes: string[]
}

const ServiceRequestRefTable: React.FC<ServiceRequestRef> = ({
                                                               data,
                                                               updateData,
                                                               search,
                                                               requestCodes
                                                             }) => {
  const [serviceReqId, setServiceReqId] = useState<string | null>(null);
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

  useEffect(() => {
    console.log('requestCodes >>> ', requestCodes)
  }, [requestCodes]);

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
    setServiceReqId(item.id)
    updateData({
      ...data,
      customerRequestNo: item.customerRequestNo,
      serviceId: item.serviceId as string,
      requestCode: item.requestCode as string
    })
    dispatch(setCustomerRequestData(item))
  }

  return (
    <DataTable columns={
      renderColumns(
        (item: ServiceRequest) => handleUpdateData(item),
        serviceReqId
      )}
               tableApi={ServiceRequestRefListApi}
               tableApiData={tableApiParams}
               showLoading={false}
               emptyData={<EmpTyData/>}
    />
  )
}

export default ServiceRequestRefTable;
