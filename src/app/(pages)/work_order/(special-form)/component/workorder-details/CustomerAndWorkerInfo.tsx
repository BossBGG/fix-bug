import React, {useEffect, useState} from "react";
import {Options, WorkOrderObj} from "@/types";
import {Card, CardContent} from "@/components/ui/card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import CardCollapse from "../CardCollapse";
import Link from "next/link";
import {format} from "date-fns";
import {th} from "date-fns/locale";
import Map from "@/app/(pages)/work_order/(special-form)/component/map/Map";
import {groupWorkerOptions} from "@/app/api/WorkOrderApi";

interface CustomerAndWorkerInfoProps {
  data: WorkOrderObj,
  eventOptions: Options[],
  workCenterOptions: Options[],
  workerOptions: Options[],
  isWorkOrderSurvey?: boolean
}

const CustomerAndWorkerInfo: React.FC<CustomerAndWorkerInfoProps> = ({
                                                                       data,
                                                                       eventOptions,
                                                                       workCenterOptions,
                                                                       workerOptions,
                                                                       isWorkOrderSurvey=false
                                                                     }) => {
  const [expandedWorkers, setExpandedWorkers] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    if(!isWorkOrderSurvey) {
      setExpandedWorkers({0: true})
    }
  }, []);

  const toggleWorkerDetails = (index: number) => {
    console.log('toggleWorkerDetails')
    setExpandedWorkers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const CustomerInform = ({title, value}: {
    title: string,
    value: string | number
  }) => (
    <div className="flex flex-wrap items-center justify-between mb-3">
      <div className="text-wrap text-[#4A4A4A]">{title} :</div>
      <div className="text-wrap text-[#160C26]">{value}</div>
    </div>
  )

  return (
    <div className="mb-3">
      <CardCollapse
        title={"ข้อมูลผู้ขอคำร้อง / ตำแหน่ง /  ที่อยู่สำหรับสำรวจพื้นที่"}
      >
        <div className="flex flex-wrap items-stretch">
          {/* ข้อมูลลูกค้า */}
          <div className="w-full lg:w-1/2 xl:w-1/3 px-2">
            <Card className="bg-white shadow-sm h-full">
              <CardContent className="p-6">
                <div className="bg-[#E1D2FF] text-center py-3 rounded-lg mb-4">
                  <div className="font-medium text-[#160C26]">
                    ข้อมูลลูกค้า
                  </div>
                </div>

                <CustomerInform title={"ชื่อ-นามสกุล"} value={data.customerName || "-"}/>

                <div className="flex flex-row justify-between">
                  <label className="text-wrap text-[#4A4A4A]">
                    เบอร์โทรศัพท์ :
                  </label>
                  <div className="flex items-center mb-3">
                    {
                      data.customerMobileNo ?
                        <Link href={`tel:${data.customerMobileNo}`} className="flex">
                          <FontAwesomeIcon icon={faPhone} color={"#03A9F4"} className="me-2"/>
                          <p className="text-[#03A9F4] underline">{data.customerMobileNo || "-"}</p>
                        </Link> : "-"
                    }
                  </div>
                </div>

                <CustomerInform title={"อีเมล"} value={data.customerEmail || "-"}/>
                <CustomerInform title={"BP"} value={data.customerBp || "-"}/>
                <CustomerInform title={"CA"} value={data.customerCa || "-"}/>

                <hr className="mb-3"/>

                <CustomerInform title={"ที่อยู่ขอรับบริการ"} value={data.customerAddress || "-"}/>
                <CustomerInform title={"Latitude"} value={data.customerLatitude || "-"}/>
                <CustomerInform title={"Longitude"} value={data.customerLongitude || "-"}/>
              </CardContent>
            </Card>
          </div>

          {/* รายชื่อผู้ปฏิบัติงาน */}
          <div className="w-full mt-3 lg:w-1/2 xl:mt-0 xl:w-1/3 px-2">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="bg-[#E1D2FF] text-center py-3 rounded-lg mb-4 h-[8%]">
                  <div className="font-medium text-[#160C26]">
                    รายชื่อผู้ปฏิบัติงาน
                  </div>
                </div>

                <div className="h-[370px] overflow-x-hidden mb-2">
                  <div className="h-full py-2 flex flex-col justify-between ">
                    {
                      data?.assignees?.length > 0 ?
                        (
                          <div className="space-y-3">
                            {data.assignees.map((worker, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg overflow-hidden"
                              >
                                {/* Header - รหัสและชื่อ พร้อม arrow */}
                                <div
                                  className="flex justify-between items-center p-3 bg-[#F2F2F2] cursor-pointer hover:bg-gray-100"
                                  onClick={() => !isWorkOrderSurvey && toggleWorkerDetails(index)}
                                >
                                  <div className="flex-1">
                                      <span className="font-medium text-gray-900">
                                        {
                                          !isWorkOrderSurvey
                                            ? `${index + 1}. ${workerOptions.find((wk) => wk.value == worker.username)?.label || "ไม่ระบุชื่อ"}`
                                            : worker.name ? `${index + 1}. ${worker.username}-${worker.name}` : worker.username
                                        }
                                      </span>
                                  </div>

                                  {
                                    !isWorkOrderSurvey && (
                                      <FontAwesomeIcon
                                        icon={
                                          expandedWorkers[index] ? faChevronUp : faChevronDown
                                        }
                                        className="text-gray-500"
                                      />
                                    )
                                  }
                                </div>

                                {/* รายละเอียด - แสดงเมื่อ expand */}
                                {!isWorkOrderSurvey && expandedWorkers[index] && (
                                  <div className="p-3 bg-[#F2F2F2] space-y-2">
                                    <CustomerInform title="กลุ่มผู้ปฏิบัติงาน" value={groupWorkerOptions.find((group) => group.value === worker.userType)?.label || ""}/>
                                    <CustomerInform title="กิจกรรม"
                                                    value={eventOptions.find((ev) => ev.value == worker.workActivityTypeId)?.label || "-"}
                                    />
                                    <CustomerInform title="ศูนย์งานหลัก"
                                                    value={workCenterOptions.find((ev) => ev.value == worker.workCenterId)?.label || "-"}
                                    />
                                    <CustomerInform title="ชั่วโมง/งาน"
                                                    value={`${worker.workHours || 0} ${worker.workUnit || ""}`}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            ไม่มีข้อมูลผู้ปฏิบัติงาน
                          </p>
                        )
                    }
                  </div>
                </div>

                {/* นัดหมายติดตั้ง */}
                <div className="h-[20%] flex flex-col justify-end pt-3">
                  <div className="text-start rounded-lg pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      นัดหมายติดตั้ง
                    </h3>
                  </div>

                  <div>
                    <div className="flex justify-between pb-1">
                      <span className="text-sm text-gray-600">วันที่นัดหมาย :</span>
                      <span className="font-medium">
                            {
                              data.appointmentDate ? format(new Date(data.appointmentDate), "dd LLLL y", {locale: th}) : '-'
                            }
                          </span>
                    </div>

                    <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            เวลาที่นัดหมาย :
                          </span>
                      <span className="font-medium">
                         {
                           data.appointmentDate ? format(new Date(data.appointmentDate), "HH:mm น.", {locale: th}) : '-'
                         }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* แผนที่ / พิกัด */}
          <div className="w-full mt-3 xl:mt-0 xl:w-1/3 px-2">
            <Map
              options={{
                showEditable: false
              }}
              latitude={data?.latitude || data?.customerLatitude || 13.7248785}
              longitude={data?.longitude || data?.customerLongitude || 100.4683009}
            />
          </div>

        </div>
      </CardCollapse>
    </div>
  );
};

export default CustomerAndWorkerInfo;
