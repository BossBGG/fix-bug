import React, {useEffect, useMemo, useRef, useState} from "react";
import {ServiceRequest, WorkOrderCreateItem} from "@/types";
import {useAppDispatch} from "@/app/redux/hook";
import ListData from "@/app/components/list/ListData";
import {WorkOrderRefListApi} from "@/app/api/WorkOrderApi";
import {renderStatusWorkOrder} from "@/app/(pages)/work_order/[id]/work-order-status";
import {format} from "date-fns";
import {th} from "date-fns/locale";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faPlus} from "@fortawesome/free-solid-svg-icons";
import {Button} from "@/components/ui/button";
import {setCustomerRequestData} from "@/app/redux/slices/CustomerRequestSlice";
import debounce from "lodash/debounce";

type WorkOrderInfo = {
  label: string;
  value: string;
}

const WorkOrderInfo: React.FC<WorkOrderInfo> = ({label, value}) => (
  <div className="flex justify-between text-[14px] mb-1">
    <div className="text-[#4A4A4A] mr-3 whitespace-nowrap">{label} :</div>
    <div className="text-[#160C26] text-end"> {value}</div>
  </div>
)

type WorkOrderRefListProps = {
  data: WorkOrderCreateItem,
  updateData: (d: WorkOrderCreateItem) => void,
  search?: string,
  requestCodes: string[]
}

export const WorkOrderRefList: React.FC<WorkOrderRefListProps> = ({
                                                                    data,
                                                                    updateData,
                                                                    search,
                                                                    requestCodes
                                                                  }) => {
  const [dataWorkOrder, setDataWorkOrder] = React.useState<ServiceRequest[]>([])
  const [workOrderId, setWorkOrderId] = React.useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const isMountedRef = useRef(true);

  useEffect(() => {
    const handler = debounce((value: string) => {
      if (isMountedRef.current) {
        setDebouncedSearch(value);
      }
    }, 800);

    handler(search || "");

    return () => {
      handler.cancel();
    };
  }, [search]);

    useEffect(() => {
      return () => {
        isMountedRef.current = false;
      };
    }, []);

  const handleSelectWorkOrder = (item: ServiceRequest) => {
    setWorkOrderId(item.id as string)
    updateData({
      ...data,
      serviceId: item.serviceId as string,
      requestCode: item.requestCode as string,
      workOrderParentId: item.id
    })

    item.workOrderParentId = item.id
    dispatch(setCustomerRequestData(item))
  }

  const tableApiParams = useMemo(() => {
    if(!isMountedRef.current) return undefined;

    return {
      search: debouncedSearch,
      requestCodes: requestCodes.toString()
    };
  }, [debouncedSearch, requestCodes]);

  return (
    <div>
      <ListData setListData={(d) => setDataWorkOrder(d as ServiceRequest[])}
                tableApi={WorkOrderRefListApi}
                tableApiData={tableApiParams}
      >
        {
          dataWorkOrder.length > 0 ?
            dataWorkOrder.map((item: ServiceRequest) => (
              <div className="border-1 border-[#E0E0E0] rounded-sm bg-[#FAF5FF] p-3 my-3" key={item.id}>
                <div className="text-[#160C26] mb-2 font-medium">{item.workOrderNo}</div>
                <WorkOrderInfo label={"เลขที่คำร้อง"} value={item.customerRequestNo || "-"}/>
                <WorkOrderInfo label={"ชื่อลูกค้า"} value={item.customerName || "-"}/>
                <WorkOrderInfo label={"สถานะคำร้อง"} value={renderStatusWorkOrder(item.statusCode)}/>
                <WorkOrderInfo label={"ประเภทงานบริการ"} value={item.serviceType}/>
                <WorkOrderInfo label={"วันที่รับคำร้อง"}
                               value={item.createdAt ? format(new Date(item.createdAt), 'dd MMMM yyyy', {locale: th}) : "-"}
                />

                <Button
                  className={`w-full rounded-full mt-3 mb-2 ${item.id === workOrderId ? 'bg-[#F9AC12] hover:bg-[#F9AC12]' : 'bg-[#671FAB] hover:bg-[#671FAB]'}`}
                  onClick={() => handleSelectWorkOrder(item)}
                >
                  {item.id === workOrderId ? <FontAwesomeIcon icon={faCheck}/> :
                    <FontAwesomeIcon icon={faPlus}/>}&nbsp;
                  เลือก
                </Button>
              </div>
            ))
            : <div className="font-bold text-[24px] mt-5">ไม่พบรายการใบสั่งงาน</div>
        }
      </ListData>
    </div>
  )
}
