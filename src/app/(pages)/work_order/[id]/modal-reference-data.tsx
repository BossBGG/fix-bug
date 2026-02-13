import Modal from "@/app/layout/Modal";
import {Button} from "@/components/ui/button";
import {Options, WorkOrderCreateItem} from "@/types";
import React, {useEffect, useState} from "react";
import {dismissAlert, showError, showProgress, showSuccess} from "@/app/helpers/Alert";
import {getServiceTypeOptions} from "@/app/api/WorkOrderOptions";
import InputSearch from "@/app/components/form/InputSearch";
import ServiceTypeSelection from "@/app/(pages)/work_order/service-type-selection";
import {useAppSelector} from "@/app/redux/hook";
import ServiceRequestRefTable from "@/app/(pages)/work_order/reference_table/service-request-ref-table";
import WorkOrderRefTable from "@/app/(pages)/work_order/reference_table/work-order-ref-table";
import ServiceRequestRefList from "@/app/(pages)/work_order/reference_list/service-request-ref-list";
import {WorkOrderRefList} from "@/app/(pages)/work_order/reference_list/work-order-ref-list";
import {referWorkOrderByMainWorkOrder, referWorkOrderByRequestNo} from "@/app/api/WorkOrderApi";
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface ModalNewWorkOrderProps {
  open: boolean,
  onClose: () => void,
  workOrderType: 'ref_service_req' | 'ref_work_order' | null,
  id: string
}

const FooterModal = ({
                       cancel,
                       submit
                     }:
                     {
                       cancel: () => void,
                       submit: () => void,
                     }) => (
  <div className="w-full flex flex-wrap justify-between items-center">
    <div className="p-2 w-1/2">
      <Button
        className="text-[#671FAB] w-full bg-white border-1 border-[#671FAB] rounded-full font-semibold md:text-start text-center cursor-pointer hover:bg-white"
        onClick={() => cancel()}
      >
        ยกเลิก
      </Button>
    </div>
    <div className="p-2 w-1/2">
      <Button className="pea-button w-full" onClick={() => submit()}>
        อ้างอิงใบสั่งงาน
      </Button>
    </div>
  </div>
)

const ModalNewWorkOrder = ({
                             open,
                             onClose,
                             workOrderType,
                             id
                           }: ModalNewWorkOrderProps) => {
  const [serviceTypeOptions, setServiceTypeOptions] = useState<Options[]>([])
  const screen_size = useAppSelector((state) => state.screen_size)

  useEffect(() => {
    fetchServiceTypeOptions()
  }, []);

  const fetchServiceTypeOptions = async () => {
    const resp = await getServiceTypeOptions();
    let options: Options[] = []
    if (resp.status === 200 && resp.data.data && resp.data.data.serviceGroups) {
      resp.data.data.serviceGroups.map((item) => {
        let sub_options = item.services?.map((sub) => {
          return {value: sub.requestCode, label: `${sub.requestCode} ${sub.name}`, data: sub}
        })

        let option: Options = {
          value: item.id,
          label: item.name,
          subOptions: sub_options
        }

        options.push(option)
      })
    }

    setServiceTypeOptions(options)
  }

  const [data, setData] = useState<WorkOrderCreateItem>({} as WorkOrderCreateItem)
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [search, setSearch] = useState<string>("")

  const submit = async () => {
    showProgress()
    if (!data.serviceId) {
      dismissAlert()
      alert('กรุณาเลือกใบสั่งงาน เพื่อใช้สำหรับอ้างอิง')
      return
    }

    let res = null;
    switch (workOrderType) {
      case "ref_service_req":
        if(!data.customerRequestNo) {
          showError('ไม่พบข้อมูลเลขที่ใบคำร้อง')
          return
        }
        res = await referWorkOrderByRequestNo(id, data.customerRequestNo)
        break
      case "ref_work_order":
        if(!data.workOrderParentId) {
          showError('ไม่พบข้อมูลเลขที่ใบสั่งงานหลัก')
          return
        }
        res = await referWorkOrderByMainWorkOrder(id, data.workOrderParentId)
        break
      default:
        break
    }

    if(res?.status === 200) {
      showSuccess('อ้างอิงใบสั่งงานสำเร็จ').then(() => {
        handleClose()
      })
    }else {
      dismissAlert()
    }
  }

  const renderTitle = () => {
    switch (workOrderType) {
      case "ref_service_req":
        return 'อ้างอิงใบคำร้อง'
      case "ref_work_order":
        return 'อ้างอิงใบสั่งงานหลัก'
      default:
        return ''
    }
  }

  const handleClose = () => {
    dismissAlert()
    setData({} as WorkOrderCreateItem);
    setSearch("")
    setServiceTypes([])
    onClose()
  }

  return (
    <Modal title={renderTitle()}
           open={open}
           onClose={() => handleClose()}
           footer={<FooterModal cancel={() => handleClose()} submit={() => submit()}/>}
           classContent="w-[80%] xl:w-[60%] 2xl:w-[45%] !max-w-[80%]"
    >
      <div className="w-full">
        <div>
          <div>
            <div className="my-2">
              {
                workOrderType === 'ref_service_req'
                  ? 'ค้นหาเลขที่ใบคำร้อง'
                  : 'ค้นหาเลขที่ใบสั่งงาน'
              }
            </div>
            <InputSearch handleSearch={setSearch}
                         placeholder={workOrderType === 'ref_service_req' ? 'ค้นหาเลขที่ใบคำร้อง' : 'ค้นหาเลขที่ใบสั่งงาน'}
            />
          </div>

          <div className="my-3">
            {/*ประเภทงานบริการ สำหรับใช้ในการ filter ข้อมูล*/}
            <ServiceTypeSelection options={serviceTypeOptions}
                                  setData={setServiceTypes}
                                  selected={serviceTypes || []}
            />
          </div>

          {
            workOrderType === "ref_service_req" &&
            <div className="my-3 w-full">
              {
                screen_size !== MOBILE_SCREEN
                  ? <ServiceRequestRefTable data={data}
                                            updateData={setData}
                                            search={search}
                                            requestCodes={serviceTypes || []}
                  />
                  : <ServiceRequestRefList data={data}
                                           updateData={setData}
                                           search={search}
                                           requestCodes={serviceTypes || []}
                  />
              }
            </div>
          }

          {
            workOrderType === "ref_work_order" &&
            <div className="my-3 w-full">
              {
                screen_size !== MOBILE_SCREEN
                  ? <WorkOrderRefTable data={data}
                                       updateData={setData}
                                       search={search}
                                       requestCodes={serviceTypes || []}
                    />
                  : <WorkOrderRefList data={data}
                                      updateData={setData}
                                      search={search}
                                      requestCodes={serviceTypes || []}
                  />

              }
            </div>
          }
        </div>
      </div>
    </Modal>
  )
}

export default ModalNewWorkOrder;
