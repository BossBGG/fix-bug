import React, {useEffect, useMemo, useRef, useState} from "react";
import ListData from "@/app/components/list/ListData";
import {ServiceRequest, WorkOrderCreateItem} from "@/types";
import {ServiceRequestRefListApi} from "@/app/api/WorkOrderApi";
import {Button} from "@/components/ui/button";
import {faCheck, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useAppDispatch, useAppSelector} from "@/app/redux/hook";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";
import {setCustomerRequestData} from "@/app/redux/slices/CustomerRequestSlice";
import debounce from "lodash/debounce";

type OrderRefInfo = {
  label: string;
  value: string;
}

const OrderRefInfo: React.FC<OrderRefInfo> = ({label, value}) => (
  <div className="flex justify-between text-[14px]">
    <div className="text-[#4A4A4A] mr-3 whitespace-nowrap">{label} :</div>
    <div className="text-[#160C26] text-end"> {value}</div>
  </div>
)

type ListOrderReferenceProps = {
  data: WorkOrderCreateItem,
  updateData: (d: WorkOrderCreateItem) => void,
  search?: string,
  requestCodes: string[]
}

const ServiceRequestRefList: React.FC<ListOrderReferenceProps> = ({
                                                                 data,
                                                                 updateData,
                                                                 search,
                                                                    requestCodes
                                                               }) => {
  const [dataServiceReq, setDataServiceReq] = useState<ServiceRequest[]>([])
  const serviceTypeOptions = useAppSelector((state) => state.options.serviceTypeOptions)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const dispatch = useAppDispatch()
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

  const tableApiParams = useMemo(() => {
    if(!isMountedRef.current) return undefined;

    return {
      search: debouncedSearch,
      requestCodes: requestCodes.toString()
    };
  }, [debouncedSearch, requestCodes]);

  const handleSelectService = (item: ServiceRequest) => {
    setSelectedService(item.id)
    updateData({
      ...data,
      customerRequestNo: item.customerRequestNo,
      serviceId: item.serviceId as string,
      requestCode: item.requestCode as string
    })
    dispatch(setCustomerRequestData(item))
  }

  return (
    <div>
      <ListData setListData={(d) => setDataServiceReq(d as ServiceRequest[])}
                tableApi={ServiceRequestRefListApi}
                tableApiData={tableApiParams}
      >
        {
          dataServiceReq.length > 0 ?
            dataServiceReq.map((item) => (
              <div className="border-1 border-[#E0E0E0] rounded-sm bg-[#FAF5FF] p-3 my-3" key={item.id}>
                <div className="text-[#160C26] mb-2 font-medium">{item.customerRequestNo}</div>
                <OrderRefInfo value={item.customerName} label="ชื่อลูกค้า"/>
                <OrderRefInfo value={item.serviceGroupName || "-"}
                              label="ประเภทงานบริการ"/>
                <OrderRefInfo value={formatJSDateTH(new Date(item.createdDate), 'dd MMMM yyyy')}
                              label="วันที่รับคำร้อง"/>

                <Button
                  className={`w-full rounded-full mt-3 mb-2 ${item.id === selectedService ? 'bg-[#F9AC12] hover:bg-[#F9AC12]' : 'bg-[#671FAB] hover:bg-[#671FAB]'}`}
                  onClick={() => handleSelectService(item)}
                >
                  {item.id === selectedService ? <FontAwesomeIcon icon={faCheck}/> :
                    <FontAwesomeIcon icon={faPlus}/>}&nbsp;
                  เลือก
                </Button>
              </div>
            ))
            : <div className="font-bold text-[24px] mt-5">ไม่พบรายการใบคำร้อง</div>
        }
      </ListData>
    </div>
  )
}

export default ServiceRequestRefList;
