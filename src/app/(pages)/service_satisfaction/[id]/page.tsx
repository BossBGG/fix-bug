"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import LatestUpdateData from "@/app/components/utils/LatestUpdateData";
import StarRating from "@/app/components/utils/StarRating";
import { formatDateTime, formatJSDateTH } from "@/app/helpers/DatetimeHelper";
import { Options, ResolvedData, SatisfactionData, WorkOrderObj } from "@/types";
import Map from "@/app/(pages)/work_order/(special-form)/component/map/Map";
import { renderStatusWorkOrder } from "@/app/(pages)/work_order/[id]/work-order-status";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import handleSearchEvent from "@/app/helpers/SearchEvent";
import handleSearchMainWorkCenter from "@/app/helpers/SearchMainWorkCenter";
import { ServiceSatisfactionDetail } from "@/app/api/ServiceSatisfactionApi";
import ServiceSatisfactionDetailBreadcrumb from "@/app/(pages)/service_satisfaction/[id]/breadcrumb";
import { groupWorkerOptions } from "@/app/api/WorkOrderApi";
import {
  mapEventOptions,
  mapWorkCenterOptions,
} from "@/app/(pages)/work_order/create_or_update/mapOptions";
import SignatureSection from "@/app/(pages)/work_order/(special-form)/component/work_execution/signature_section";
import {dismissAlert, showProgress} from "@/app/helpers/Alert";
import {useJsApiLoader} from "@react-google-maps/api";

const libraries: ('places' | 'geometry')[] = ['places','geometry'];
const ServiceSatisfactionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { setBreadcrumb } = useBreadcrumb();
  const [data, setData] = useState<SatisfactionData>({} as SatisfactionData);
  const [eventOptions, setEventOptions] = useState<Options[]>([]);
  const [workCenterOptions, setMainWorkCenterOptions] = useState<Options[]>([]);
  const id = params.id as string;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: window.__ENV__?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  });


  useEffect(() => {
    setBreadcrumb(
      <ServiceSatisfactionDetailBreadcrumb
        title={"รายละเอียดการประเมินความพึงพอใจ"}
      />
    );
    fetchSatisfactionDetail();
  }, []);

  const fetchSatisfactionDetail = async () => {
    showProgress()
    ServiceSatisfactionDetail(id).then((res) => {
      if (res.status === 200) {
        const items = res.data.data;
        setData(items);
        const requests: { [K in keyof ResolvedData]?: Promise<Options[]> } = {
          respEventOptions: handleSearchEvent(),
          resMainWorkCenter: handleSearchMainWorkCenter(),
        };

        const promiseKeys = Object.keys(requests) as Array<keyof ResolvedData>;
        const promiseValues = Object.values(requests);

        Promise.all(promiseValues).then(async (results) => {
          const resolvedData = promiseKeys.reduce((acc, key, index) => {
            acc[key] = results[index];
            return acc;
          }, {} as ResolvedData);

          const { respEventOptions, resMainWorkCenter, resWorkerOptions } =
            resolvedData;
          setEventOptions(respEventOptions || []);
          setMainWorkCenterOptions(resMainWorkCenter || []);

          if (items.workers?.length > 0) {
            const assignees = items.workers;
            const newEventOpts = await mapEventOptions(
              assignees,
              eventOptions || [],
              "activity"
            );
            setEventOptions(newEventOpts);
            const newWorkCenterOptions = await mapWorkCenterOptions(
              assignees,
              resMainWorkCenter || [],
              "mainWorkCenter"
            );
            setMainWorkCenterOptions(newWorkCenterOptions);
          }
        });
        dismissAlert()
      }
    });
  };

  const InfoRow = ({ title, value }: { title: string; value: string }) => (
    <div className="flex flex-wrap items-center justify-between mb-3">
      <div className="text-[#4A4A4A]">{title} :</div>
      <div className="text-[#160C26] font-medium">{value}</div>
    </div>
  );

  const [expandedWorkers, setExpandedWorkers] = useState<{
    [key: number]: boolean;
  }>({
    0: true, // worker แรกให้ expand ไว้
  });

  const toggleWorkerDetails = (index: number) => {
    console.log("toggleWorkerDetails");
    setExpandedWorkers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="px-6">
      <LatestUpdateData />

      {/* ข้อมูลใบสั่งงาน */}
      <Card className="bg-[#F4EEFF] shadow-sm mb-4">
        <CardContent className="p-5">
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/2 px-2 md:border-r-1 md:border-r-[#AAAAAA]">
              <InfoRow
                title="เลขที่คำร้อง"
                value={data.workOrder?.workOrderNumber || "-"}
              />
              <InfoRow
                title="เลขที่คำร้องจาก SAP"
                value={data.serviceRequest?.sapRequestNumber || "-"}
              />
              <InfoRow
                title="ประเภทใบสั่งงาน"
                value={data.serviceRequest?.serviceTypeName || "-"}
              />

              <div className="flex flex-wrap items-center justify-between mb-3">
                <div className="text-[#4A4A4A]">สถานะคำร้อง :</div>
                <span className="bg-[#F9AC12] px-3 py-1 rounded-sm text-white text-sm font-medium">
                  {renderStatusWorkOrder(data.serviceRequest?.status)}
                </span>
              </div>
            </div>

            <div className="w-full md:w-1/2 px-2">
              <InfoRow
                title="ประเภทงานบริการ"
                value={data.serviceRequest?.serviceType || "-"}
              />
              <InfoRow
                title="ช่องทางรับคำร้อง"
                value={data.serviceRequest?.channel || "-"}
              />
              <InfoRow
                title="วันที่รับคำร้อง"
                value={
                  data.serviceRequest?.receivedDate
                    ? formatJSDateTH(
                        new Date(data.serviceRequest?.receivedDate),
                        "d MMMM yyyy"
                      )
                    : "-"
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <CardCollapse
        title={"ข้อมูลผู้ขอคำร้อง / ตำแหน่ง /  ที่อยู่สำหรับสำรวจพื้นที่"}
      >
        <div className="flex flex-wrap items-stretch">
          {/* ข้อมูลลูกค้า */}
          <div className="w-full lg:w-1/3">
            <Card className="bg-white shadow-sm h-full">
              <CardContent className="p-6">
                <div className="bg-[#E1D2FF] text-center py-3 rounded-lg mb-4">
                  <div className="font-medium text-[#160C26]">ข้อมูลลูกค้า</div>
                </div>

                <InfoRow
                  title="ชื่อลูกค้า"
                  value={data.customer?.name || "-"}
                />

                <div className="flex flex-row justify-between mb-3">
                  <label className="text-[#4A4A4A]">โทรศัพท์มือถือ</label>
                  <div className="flex items-center">
                    {data.customer?.phone ? (
                      <a
                        href={`tel:${data.customer.phone}`}
                        className="flex items-center"
                      >
                        <FontAwesomeIcon
                          icon={faPhone}
                          color="#03A9F4"
                          className="mr-2"
                        />
                        <span className="text-[#03A9F4] underline">
                          {data.customer.phone}
                        </span>
                      </a>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>

                <InfoRow
                  title="อีเมลติดต่อ"
                  value={"Sujinda_yuda@email.co.th"}
                />
                <InfoRow title="BP" value={data.customer?.bp || "-"} />
                <InfoRow title="CA" value={data.customer?.ca || "-"} />

                <hr className="my-4" />

                <InfoRow
                  title="ที่อยู่ขอรับบริการ"
                  value={
                    "ไฟชั่วคราว ต.หนองขนาน อ.เมืองเพชรบุรี จ.เพชรบุรี 76000"
                  }
                />
                <InfoRow
                  title="Latitude"
                  value={data.customer?.latitude?.toString()}
                />
                <InfoRow
                  title="Longitude"
                  value={data.customer?.longitude?.toString()}
                />
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-1/3 lg:px-3 lg:my-0 my-3">
            <Card className="bg-white shadow-sm h-full">
              <CardContent className="p-6">
                <div className="bg-[#E1D2FF] text-center py-3 rounded-lg mb-4">
                  <div className="font-medium text-[#160C26]">
                    รายชื่อผู้ปฏิบัติงาน
                  </div>
                </div>

                <div className="h-[370px] overflow-x-hidden mb-2">
                  <div className="h-full py-2 flex flex-col justify-between ">
                    {data?.workers?.length > 0 ? (
                      <div className="space-y-3">
                        {data.workers.map((worker, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            {/* Header - รหัสและชื่อ พร้อม arrow */}
                            <div
                              className="flex justify-between items-center p-3 bg-[#F2F2F2] cursor-pointer hover:bg-gray-100"
                              onClick={() => toggleWorkerDetails(index)}
                            >
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">
                                  {index + 1}.{" "}
                                  {worker.employeeId
                                    ? `${worker.employeeId} - `
                                    : ""}
                                  {worker.name || "ไม่ระบุชื่อ"}
                                </span>
                              </div>

                              <FontAwesomeIcon
                                icon={
                                  expandedWorkers[index]
                                    ? faChevronUp
                                    : faChevronDown
                                }
                                className="text-gray-500"
                              />
                            </div>

                            {/* รายละเอียด - แสดงเมื่อ expand */}
                            {expandedWorkers[index] && (
                              <div className="p-3 bg-[#F2F2F2] space-y-2">
                                <InfoRow
                                  title="กลุ่มผู้ปฏิบัติงาน"
                                  value={
                                    groupWorkerOptions.find(
                                      (group) => group.value === worker.group
                                    )?.label || ""
                                  }
                                />
                                <InfoRow
                                  title="กิจกรรม"
                                  value={
                                    eventOptions.find(
                                      (ev) => ev.value == worker.activity
                                    )?.label || "-"
                                  }
                                />
                                <InfoRow
                                  title="ศูนย์งานหลัก"
                                  value={
                                    workCenterOptions.find(
                                      (ev) => ev.value == worker.mainWorkCenter
                                    )?.label || "-"
                                  }
                                />
                                <InfoRow
                                  title="ชั่วโมง/งาน"
                                  value={`${worker.hoursPerWork || 0}`}
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
                    )}
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
                      <span className="text-sm text-gray-600">
                        วันที่นัดหมาย :
                      </span>
                      <span className="font-medium">
                        {data.appointment
                          ? data.appointment.appointmentDate
                          : "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        เวลาที่นัดหมาย :
                      </span>
                      <span className="font-medium">
                        {data.appointment
                          ? data.appointment.appointmentTime
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* แผนที่ / พิกัด */}
          <div className="w-full lg:w-1/3">
            <Card className="bg-white shadow-sm h-full">
              <CardContent className="p-6">
                {
                  isLoaded ? (
                    <Map
                      latitude={data.customer?.latitude || 0}
                      longitude={data.customer?.longitude || 0}
                      options={{
                        showEditable: false,
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[400px]">
                      <p>Loading map...</p>
                    </div>
                  )
                }
              </CardContent>
            </Card>
          </div>
        </div>
      </CardCollapse>

      {/* คะแนนประเมิน */}
      <div className="w-full my-3">
        <CardCollapse title={"ความพึงพอใจต่อการให้บริการ"}>
          <CardContent>
            <div className="flex flex-wrap">
              <div className="w-full md:w-1/2 pr-0 md:pr-3">
                <div className="flex items-center mb-3">
                  <div className="text-[#4A4A4A]">คะแนนประเมิน : </div>
                  <div className="mx-2">
                    {" "}
                    {data.satisfaction?.overallRating || 0}/5
                  </div>
                  <div className="-mt-[5px]">
                    <StarRating
                      score={data.satisfaction?.overallRating || 0}
                      showScore={false}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="text-[#4A4A4A] me-2">ความคิดเห็น :</div>
                  <div className="text-[#160C26]">
                    {data.satisfaction?.comment || "-"}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 h-[300px]">
                <SignatureSection
                  title={"ภาพลายเซ็นลูกค้า"}
                  signature={data.customer?.signatureUrl || ""}
                  onSignatureChange={() => {}}
                  isReadOnly={true}
                />
              </div>
            </div>
          </CardContent>
        </CardCollapse>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between items-center mt-6 w-full">
        <Button
          className="rounded-full text-[#A6A6A6] border-1 border-[#A6A6A6] bg-white hover:bg-white md:w-auto w-full"
          onClick={() => router.push("/service_satisfaction")}
        >
          ย้อนกลับ
        </Button>

        <div className="flex gap-3 md:w-auto w-full mt-4 md:mt-0">
          <Button
            className="rounded-full cursor-pointer text-white bg-[#671FAB] hover:bg-[#671FAB] w-full"
            onClick={() =>
              router.push(`/work_order/${data.workOrder?.workOrderId}`)
            }
          >
            ผลปฏิบัติงาน
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceSatisfactionDetailPage;
