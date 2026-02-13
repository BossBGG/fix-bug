"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import {
  cancellableStatuses,
  getWorkOrderDetailById,
  updateWorkOrderStatus,
} from "@/app/api/WorkOrderApi";
import {
  Options,
  ResolvedData,
  S301ServiceData,
  S316ServiceData,
  S318ServiceData,
  WorkOrderObj,
} from "@/types";
import WorkOrderDetailBreadcrumb from "@/app/(pages)/work_order/[id]/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faClock,
  faPlus,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import LatestUpdateData from "@/app/components/utils/LatestUpdateData";
import WorkOrderInfo from "@/app/(pages)/work_order/(special-form)/component/workorder-details/WorkOrderInfo";
import { renderStatusWorkOrder } from "@/app/(pages)/work_order/[id]/work-order-status";
import CustomerAndWorkerInfo from "@/app/(pages)/work_order/(special-form)/component/workorder-details/CustomerAndWorkerInfo";
import handleSearchEvent from "@/app/helpers/SearchEvent";
import handleSearchMainWorkCenter from "@/app/helpers/SearchMainWorkCenter";
import { getWorkerListOptions } from "@/app/helpers/WorkerOptions";
import {
  mapEventOptions,
  mapMeterEquipmentOptions,
  mapRequestServiceOptions,
  mapWorkCenterOptions,
  mapWorkerOptions,
} from "@/app/(pages)/work_order/create_or_update/mapOptions";
import MaterialEquipmentChecklistPage from "@/app/(pages)/work_order/(special-form)/component/material_equipment_checklist/material_equipment_checklist";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import ElectricalList from "@/app/(pages)/work_order/(special-form)/s301/electrical-list";
import handleSearchServiceEquipmentType from "@/app/helpers/SearchServiceEquipmentType";
import RequestServiceTypeSelector from "@/app/(pages)/work_order/(special-form)/s305/RequestServiceTypeSelector";
import VoltageLevel from "@/app/(pages)/work_order/(special-form)/s307/Voltagelevel";
import TransformerDateSelector from "@/app/(pages)/work_order/(special-form)/s315/TransformerDateSelector";
import InsulatorList from "@/app/(pages)/work_order/(special-form)/s314/insulator-list";
import TransFormerList315 from "@/app/(pages)/work_order/(special-form)/s315/electrical-list";
import ElectricGenerator from "@/app/(pages)/work_order/(special-form)/s316/electric-generator";
import MeterEquipmentList from "@/app/(pages)/work_order/(special-form)/s318/electrical-list";
import BusinessTypePackage from "@/app/(pages)/work_order/(special-form)/s322/BusinessTypePackage";
import InverterComponent from "@/app/(pages)/work_order/(special-form)/s332-solar-battery/Inverter";
// import AddImagesSolarBatteryExecution from "@/app/(pages)/work_order/(special-form)/s332-solar-battery/AddImagesSolarBatteryExecution ";
import DistanceComponent from "@/app/(pages)/work_order/(special-form)/s332-solar-air-conditioner/Distance";
// import AddImagesSolarAirCondition from "@/app/(pages)/work_order/(special-form)/s332-solar-air-conditioner/AddImagesSolarAirCondition ";
import EnergyRequirement from "@/app/(pages)/work_order/(special-form)/s329/EnergyRequirement";
import EnergySource from "@/app/(pages)/work_order/(special-form)/s329/EnergySource";
import SurveyPeriod from "@/app/(pages)/work_order/(special-form)/s329/SurveyPeriod";
import handleSearchBusinessType from "@/app/helpers/SearchBusinessType";
import {
  handleSearchTransformerBrands,
  handleSearchTransformerPhase,
  handleSearchTransformerSize,
  handleSearchTransformerType,
  handleSearchTransformerVoltage,
} from "@/app/helpers/SearchTransformer.";
import {
  handleSearchRenewableSource,
  handleSearchRenewableType,
} from "@/app/helpers/SearchRenewable";
import { handleSearchRequestService } from "@/app/helpers/SearchRequestService";
import { handleSearchServiceType } from "@/app/helpers/SearchServiceType";
import BusinessType from "@/app/(pages)/work_order/(special-form)/component/work_execution/business_type";
import TransformerList from "@/app/(pages)/work_order/(special-form)/s305/transformer-list";
import { ModalConfirm } from "@/app/components/utils/ModalConfirm";
import PopupStartWork from "@/assets/images/popup_startwork.png";
import {dismissAlert, showConfirm, showError, showProgress, showSuccess} from "@/app/helpers/Alert";
import { useOfflineStartWorkOrder } from "@/components/offline/OfflineStartWorkOrderForm";
import { getMeterEquipmentOptions } from "@/app/api/MaterialEquipmentApi";
import ModalReferenceData from "@/app/(pages)/work_order/[id]/modal-reference-data";
import { ModalRelationWorkOrder } from "@/app/(pages)/work_order/[id]/modal-relation-work-order";
import HistoryModal from "@/app/(pages)/work_order/[id]/HistoryModal";
import { formatJSDate } from "@/app/helpers/DatetimeHelper";
import { searchMeterEquipmentOptions } from "@/app/helpers/SearchMeterEquipment";
import {ApiResponse} from "@/app/api/Api";
import ModalCancelWorkOrder from "@/app/(pages)/work_order/modal-cancel-work-order";

const WorkOrderDetail = () => {
  const params = useParams();
  const [data, setData] = useState<WorkOrderObj>({} as WorkOrderObj);
  const id = params.id as string;
  const router = useRouter();
  const { setBreadcrumb } = useBreadcrumb();
  const { startWorkOrder, isProcessing: isStartingWork } = useOfflineStartWorkOrder();
  const [eventOptions, setEventOptions] = useState<Options[]>([]);
  const [mainWorkCenterOptions, setMainWorkCenterOptions] = useState<Options[]>(
    []
  );
  const [serviceEquipmentOptions, setServiceEquipmentOptions] = useState<
    Options[]
  >([]);
  const [businessTypeOptions, setBusinessTypeOptions] = useState<Options[]>([]);
  const [voltagesOptions, setVoltagesOptions] = useState<Options[]>([]);
  const [renewableSourceOptions, setRenewableSourceOptions] = useState<
    Options[]
  >([]);
  const [renewableTypeOptions, setRenewableTypeOptions] = useState<Options[]>(
    []
  );
  const [workerOptions, setWorkerOptions] = useState<Options[]>([]);
  const [transformerBrandOptions, setTransformerBrandOptions] = useState<
    Options[]
  >([]);
  const [transformerPhaseOptions, setTransformerPhaseOptions] = useState<
    Options[]
  >([]);
  const [transformerTypeOptions, setTransformerTypeOptions] = useState<
    Options[]
  >([]);
  const [transformerSizeOptions, setTransformerSizeOptions] = useState<
    Options[]
  >([]);
  const [requestServiceOptions, setRequestServiceOptions] = useState<Options[]>(
    []
  );
  const [serviceTypesOptions, setServiceTypesOptions] = useState<Options[]>([]);
  const [requestCode, setRequestCode] = useState<string>("");
  const [isShowConfirmStart, setIsShowConfirmStart] = useState(false);
  const [meterEquipmentOptions, setMeterEquipmentOptions] = useState<Options[]>(
    []
  );
  const defaultClassMenuItem =
    "p-3 cursor-pointer mb-3 flex justify-center items-center";
  const workOrderRef = useRef<HTMLDivElement>(null);
  const [refType, setRefType] = useState<
    "ref_service_req" | "ref_work_order" | null
  >(null);
  const [showWorkOrderRelation, setShowWorkOrderRelation] =
    useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showCancelWorkOrder, setShowCancelWorkOrder] = useState(false);

  useEffect(() => {
    setBreadcrumb(<WorkOrderDetailBreadcrumb path={id} title={"ใบสั่งงาน"} />);
    showProgress();
    getWorkOrderDetailById(id, false).then(async (res) => {
      if (res.status === 200) {
        let items = res.data.data as WorkOrderObj;
        let reqCode = items.requestCode.toLowerCase() as string;
        setRequestCode(reqCode);
        setData(items);

        const requests: { [K in keyof ResolvedData]?: Promise<Options[]> } = {
          respEventOptions: handleSearchEvent(),
          resMainWorkCenter: handleSearchMainWorkCenter(),
          resWorkerOptions: getWorkerListOptions(),
        };

        if (["s301", "s312"].includes(reqCode)) {
          requests.resServiceEquipmentOptions =
            handleSearchServiceEquipmentType("", reqCode);
        }

        if (reqCode === "s318") {
          requests.resMeterEquipmentOptions = searchMeterEquipmentOptions(
            "",
            reqCode
          );
        }

        if (
          [
            "s312",
            "s315",
            "s318",
            "s302",
            "s303",
            "s304",
            "s306",
            "s307",
            "s309",
            "s310",
            "s311",
            "s317",
            "s319",
            "s320",
            "s322",
            "s323",
            "s399",
          ].includes(reqCode)
        ) {
          requests.resBusinessType = handleSearchBusinessType();
        }

        if (["s307", "s305", "s308"].includes(reqCode)) {
          requests.resVoltages = handleSearchTransformerVoltage("", reqCode);
        }

        if (reqCode === "s329") {
          requests.resRenewableSource = handleSearchRenewableSource(
            "",
            reqCode
          );
          requests.resRenewableType = handleSearchRenewableType("", reqCode);
        }

        if (["s305", "s308"].includes(reqCode)) {
          requests.resTransformerBrands = handleSearchTransformerBrands(
            "",
            reqCode
          );
          requests.resTransformerPhase = handleSearchTransformerPhase(
            "",
            reqCode
          );
          requests.resTransformerType = handleSearchTransformerType(
            "",
            reqCode
          );
          requests.resTransformerSize = handleSearchTransformerSize(
            "",
            reqCode
          );
        }

        if (reqCode === "s305") {
          requests.resReqService = handleSearchRequestService("", reqCode);
          requests.resServiceTypes = handleSearchServiceType("", reqCode);
        }

        const promiseKeys = Object.keys(requests) as Array<keyof ResolvedData>;
        const promiseValues = Object.values(requests);

        Promise.all(promiseValues).then(async (results) => {
          const resolvedData = promiseKeys.reduce((acc, key, index) => {
            acc[key] = results[index];
            return acc;
          }, {} as ResolvedData);

          const {
            respEventOptions,
            resMainWorkCenter,
            resServiceEquipmentOptions,
            resBusinessType,
            resVoltages,
            resRenewableSource,
            resRenewableType,
            resWorkerOptions,
            resTransformerBrands,
            resTransformerPhase,
            resTransformerType,
            resTransformerSize,
            resReqService,
            resServiceTypes,
            resMeterEquipmentOptions,
          } = resolvedData;

          setEventOptions(respEventOptions || []);
          setMainWorkCenterOptions(resMainWorkCenter || []);
          setServiceEquipmentOptions(resServiceEquipmentOptions || []);
          setBusinessTypeOptions(resBusinessType || []);
          setVoltagesOptions(resVoltages || []);
          setRenewableSourceOptions(resRenewableSource || []);
          setRenewableTypeOptions(resRenewableType || []);
          setWorkerOptions(resWorkerOptions || []);
          setTransformerBrandOptions(resTransformerBrands || []);
          setTransformerPhaseOptions(resTransformerPhase || []);
          setTransformerTypeOptions(resTransformerType || []);
          setTransformerSizeOptions(resTransformerSize || []);
          setRequestServiceOptions(resReqService || []);
          setServiceTypesOptions(resServiceTypes || []);

          if (items.serviceSpecificData) {
            if (["s301", "s312"].indexOf(reqCode) > -1) {
              const reqService = items.serviceSpecificData as S301ServiceData;
              const newServiceEqOptions = await mapRequestServiceOptions(
                reqService?.equipments || [],
                resServiceEquipmentOptions || [],
                reqCode
              );
              setServiceEquipmentOptions(newServiceEqOptions);
            }

            if (reqCode === "s316") {
              const serviceS316 = items.serviceSpecificData as S316ServiceData;
              items.serviceSpecificData = {
                ...items.serviceSpecificData,
                generatorStartTime: serviceS316.generatorStartTime
                  ? formatJSDate(
                      new Date(serviceS316.generatorStartTime),
                      "HH:mm"
                    )
                  : "",
                generatorEndTime: serviceS316.generatorEndTime
                  ? formatJSDate(
                      new Date(serviceS316.generatorEndTime),
                      "HH:mm"
                    )
                  : "",
              } as S316ServiceData;
            }

            if (reqCode === "s318") {
              const serviceSpecS318 =
                items.serviceSpecificData as S318ServiceData;
              const materialEquipment = await mapMeterEquipmentOptions(
                serviceSpecS318.equipments,
                resMeterEquipmentOptions || [],
                reqCode
              );
              setMeterEquipmentOptions(materialEquipment);
            }
          }

          if (items.assignees?.length > 0) {
            let assignees = items.assignees;
            const newWorkerOpts = await mapWorkerOptions(
              assignees,
              workerOptions || []
            );
            setWorkerOptions(newWorkerOpts);
            const newEventOpts = await mapEventOptions(
              assignees,
              eventOptions || []
            );
            setEventOptions(newEventOpts);
            const newWorkCenterOptions = await mapWorkCenterOptions(
              assignees,
              resMainWorkCenter || []
            );
            setMainWorkCenterOptions(newWorkCenterOptions);
          }
        });
      }

      dismissAlert();
    });
  }, []);

  const handleHistory = () => {
    console.log("Show history");
  };

  const handleEdit = () => {
    // มีแค่ status W,O,K
    let params = new URLSearchParams({
      id: id,
      // workOrderNo: data.workOrderNo as string,
      requestCode: requestCode as string,
      // statusCode: data.workOrderStatusCode
    });

    switch (data.workOrderStatusCode) {
      case "W":
        params.append("isEdit", "true");
        router.push(`/work_order/create_or_update?${params.toString()}`);
        break;
      default: //O,K
        params.append("isExecute", "true");
        router.push(`/work_order/create_or_update?${params.toString()}`);
        break;
    }
  };

  const handleConfirmStart = () => {
    setIsShowConfirmStart(true);
  };

  const handleRecordResult = () => {
    const params = new URLSearchParams({
      id: id,
      // workOrderNo: data.workOrderNo as string,
      requestCode: requestCode as string,
      isExecute: "true",
      // statusCode: "O"
    });
    router.push(`/work_order/create_or_update?${params.toString()}`);
  };

  const submitConfirmStart = async () => {
    const result = await startWorkOrder(id);
    if (result.success) {
      handleRecordResult();
    }
  };

  const renderElectrical = () => {
    return (
      <ElectricalList
        data={data}
        serviceEquipmentOptions={serviceEquipmentOptions}
        requestCode={requestCode}
        options={{
          showCardCollapse: false,
          isReadOnly: true,
          showActionColumn: false,
        }}
      />
    );
  };

  const renderBusinessType = () => {
    return (
      <div className="p-4 border-1 mb-4 rounded-lg shadow-md ">
          <BusinessType
            data={data || ({} as WorkOrderObj)}
            updateData={(d) => setData(d as WorkOrderObj)}
            onUpdateOptions={setBusinessTypeOptions}
            businessOptions={businessTypeOptions}
            disabled={true}
          />
      </div>
    );
  };

  const renderTransformerList = () => {
    return (
      <TransformerList
        data={data || ({} as WorkOrderObj)}
        brandOptions={transformerBrandOptions}
        phaseOptions={transformerPhaseOptions}
        typeOptions={transformerTypeOptions}
        sizeOptions={transformerSizeOptions}
        voltageOptions={voltagesOptions}
        onUpdateBrandOptions={setTransformerBrandOptions}
        onUpdatePhaseOptions={setTransformerPhaseOptions}
        onUpdateTypeOptions={setTransformerTypeOptions}
        onUpdateSizeOptions={setTransformerSizeOptions}
        onUpdateVoltageOptions={setVoltagesOptions}
        reqCode={requestCode}
        options={{
          showAddButton: false,
          showDeleteAllButton: false,
          showActionColumn: false,
          isReadOnly: true,
        }}
      />
    );
  };

  const renderByService = () => {
    switch (requestCode) {
      case "s301":
        return renderElectrical();
      case "s302":
      case "s303":
      case "s304":
      case "s306":
      case "s309":
      case "s310":
      case "s311":
      case "s317":
      case "s319":
      case "s320":
      case "s323":
      case "s399":
        return renderBusinessType();
      case "s305":
        return (
          <div>
            <RequestServiceTypeSelector
              data={data}
              updateData={setData}
              requestServiceOptions={requestServiceOptions}
              onUpdateRequestServiceOptions={setRequestServiceOptions}
              serviceTypesOptions={serviceTypesOptions}
              onUpdateServiceTypesOptions={setServiceTypesOptions}
              reqCode={requestCode}
              disabled={true}
            />

            {renderTransformerList()}
          </div>
        );
      case "s307":
        return (
          <VoltageLevel
            businessTypeOptions={businessTypeOptions}
            voltagesOptions={voltagesOptions}
            onUpdateBusinessTypeOptions={setBusinessTypeOptions}
            data={data}
            onUpdateData={setData}
            disabled={true}
          />
        );
      case "s308":
        return renderTransformerList();
      case "s312":
        return (
          <div>
            {renderBusinessType()}

            {renderElectrical()}
          </div>
        );
      case "s314":
        return (
          <div>
            <TransformerDateSelector
              data={data || ({} as WorkOrderObj)}
              updateData={setData}
              label={"วันที่เช่าฉนวนครอบสายไฟฟ้า"}
              disabled={true}
            />

            <InsulatorList
              data={data}
              updateData={setData}
              options={{
                showDeleteAllButton: false,
                showActionColumn: false,
                showAddButton: false,
                isReadOnly: true,
              }}
            />
          </div>
        );
      case "s315":
        return (
          <div>
            {renderBusinessType()}

            <TransformerDateSelector
              data={data || ({} as WorkOrderObj)}
              updateData={setData}
              disabled={true}
            />

            <TransFormerList315
              data={data || ({} as WorkOrderObj)}
              updateData={setData}
              options={{
                showActionColumn: false,
                showDeleteAllButton: false,
                showAddButton: false,
                isReadOnly: true,
              }}
            />
          </div>
        );
      case "s316":
        return (
          <div>
            <TransformerDateSelector
              data={data || ({} as WorkOrderObj)}
              updateData={setData}
              disabled={true}
            />

            <ElectricGenerator
              data={data}
              updateData={setData}
              disabled={true}
            />
          </div>
        );
      case "s318":
        return (
          <div>
            {renderBusinessType()}

            <MeterEquipmentList
              data={data || ({} as WorkOrderObj)}
              updateData={setData}
              meterEquipmentOptions={meterEquipmentOptions}
              onUpdateOptions={setMeterEquipmentOptions}
              requestCode={requestCode}
              options={{
                showDeleteAllButton: false,
                showAddButton: false,
                showActionColumn: false,
                isReadOnly: true,
              }}
            />
          </div>
        );
      case "s322":
        return (
          <BusinessTypePackage
            businessTypeOptions={businessTypeOptions}
            data={data || ({} as WorkOrderObj)}
            disabled={true}
          />
        );
      case "s332-solar-battery":
        return (
          <div>
            <InverterComponent data={data} disabled={true} />

            {/*<AddImagesSolarBatteryExecution
              onImagesChange={(images) => {
                console.log("Images updated:", images);
              }}
            />*/}
          </div>
        );
      case "s332-solar-air-condition":
        return (
          <div>
            <DistanceComponent data={data} disabled={true} />

            {/*<AddImagesSolarAirCondition
              onImagesChange={(images) => {
                console.log("Images updated:", images);
              }}
            />*/}
          </div>
        );
      case "s329":
        return (
          <div>
            <EnergyRequirement
              options={renewableSourceOptions}
              data={data || ({} as WorkOrderObj)}
              disabled={true}
            />

            <EnergySource
              options={renewableTypeOptions}
              data={data || ({} as WorkOrderObj)}
              disabled={true}
            />

            <SurveyPeriod data={data || ({} as WorkOrderObj)} disabled={true} />
          </div>
        );
    }
  };

  const onSelectRef = (type: "ref_service_req" | "ref_work_order" | null) => {
    setRefType(type);
  };

  const handleCancelWorkOrder = () => {
    setShowCancelWorkOrder(true)
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center items-center md:justify-between">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div>
            <div className="flex items-center mb-2">
              <h1 className="text-[24px] font-bold text-[#671FAB] mr-3">
                {data.workOrderNo}
              </h1>

              {
                data.sapStatusCodes && data.sapStatusCodes === 'SAP_CANCELLED' &&
                (
                  <div className="bg-[#E02424] px-2 py-1 rounded-md text-[16px] text-white font-medium">
                    ยกเลิกการส่งข้อมูลขึ้น SAP
                  </div>
                )
              }
            </div>
            <LatestUpdateData showConnectInfo={false}/>
          </div>

          <Button
            className="bg-[#E1D2FF] hover:bg-[#E1D2FF] rounded-full justify-center items-center h-[44px] w-[44px] p-0 cursor-pointer md:hidden"
            variant="outline"
            onClick={() => setShowHistory(true)}
          >
            <FontAwesomeIcon icon={faClock} color={"#671FAB"} size={"lg"} />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-5 w-full md:w-auto">
          <Button
            className="pea-button h-[44px]"
            variant="outline"
            onClick={() => {
              setShowWorkOrderRelation(true);
            }}
          >
            แสดงความสัมพันธ์ใบสั่งงาน
          </Button>

          {
            !data.sapStatusCodes || (data.sapStatusCodes && data.sapStatusCodes !== 'SAP_CANCELLED')
            ? (
                <div className="flex " ref={workOrderRef}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="pea-button h-[44px] px-3 w-full"
                        variant="outline"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        สร้าง/อ้างอิง ใบคำร้อง
                        <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      style={{ width: workOrderRef.current?.offsetWidth + "px" }}
                    >
                     {/* <DropdownMenuItem
                        className={defaultClassMenuItem}
                        // onClick={() => {ส่งเข้าระบบของ pea}}
                      >
                        สร้างใบคำร้องใหม่
                      </DropdownMenuItem>*/}
                      <DropdownMenuItem
                        className={defaultClassMenuItem}
                        onClick={() => onSelectRef("ref_service_req")}
                      >
                        อ้างอิงใบคำร้อง
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={defaultClassMenuItem}
                        onClick={() => onSelectRef("ref_work_order")}
                      >
                        อ้างอิงใบสั่งงาน
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : <div></div>
          }

          <Button
            className="bg-[#E1D2FF] hover:bg-[#E1D2FF] rounded-full justify-center items-center h-[44px] w-[44px] p-0 cursor-pointer hidden md:flex"
            variant="outline"
            onClick={() => setShowHistory(true)}
          >
            <FontAwesomeIcon icon={faClock} color={"#671FAB"} size={"lg"} />
          </Button>
        </div>
      </div>

      <div className="w-full">
        {/* Work Order Detail */}
        <WorkOrderInfo
          data={data}
          status={renderStatusWorkOrder(data.workOrderStatusCode)}
          mainWorkCenterOptions={mainWorkCenterOptions}
        />

        {/* ข้อมูลลูกค้า รายชื่อผู้ปฏิบัติงาน แผนที่ / พิกัด */}
        <CustomerAndWorkerInfo
          data={data}
          eventOptions={eventOptions}
          workCenterOptions={mainWorkCenterOptions}
          workerOptions={workerOptions}
        />

        {/*<CardCollapse title={"ข้อมูลคำร้อง"}>
          {data.serviceSpecificData ? (
            renderByService()
          ) : (
            <div className="w-full p-3 text-grey-500 text-center">
              ไม่พบข้อมูลคำร้อง
            </div>
          )}
        </CardCollapse>*/}

        <MaterialEquipmentChecklistPage
          data={data.equipments || []}
          options={{
            isReadOnly: true,
          }}
        />
      </div>

      {
        !data.sapStatusCodes || (data.sapStatusCodes && data.sapStatusCodes !== 'SAP_CANCELLED')
          ? (
            <div className="flex flex-wrap justify-between items-center">
              <div className="w-full md:w-auto">
                <Button
                  className="rounded-full text-[#A6A6A6] border-1 border-[#A6A6A6] bg-white hover:bg-white cursor-pointer w-full md:w-auto"
                  onClick={() => router.push("/work_order")}
                >
                  ยกเลิก
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto md:mt-0 mt-3">
                {
                  cancellableStatuses.includes(data.workOrderStatusCode) &&
                  (
                    <div className="md:w-auto w-full">
                      <Button
                        className="rounded-full text-[#671FAB] hover:text-[#671FAB] bg-white border-1 hover:bg-white border-[#671FAB] cursor-pointer w-full md:w-auto"
                        variant="outline"
                        onClick={handleCancelWorkOrder}
                      >
                        ยกเลิกใบสั่งงาน
                      </Button>
                    </div>
                  )
                }

                <div className="w-full md:w-auto">
                  <Button className="rounded-full text-[#671FAB] bg-white border-1 hover:bg-white border-[#671FAB] cursor-pointer w-full md:w-auto">
                    <FontAwesomeIcon icon={faPrint} className="mr-2" />
                    พิมพ์เอกสาร
                  </Button>
                </div>

                {!["B", "J", "T", "X", "Y", "Z", "M"].includes(
                  data.workOrderStatusCode
                ) && (
                  <div className="w-full md:w-auto">
                    <Button
                      className="rounded-full text-[#671FAB] bg-white cursor-pointer hover:bg-white border-1 border-[#671FAB] w-full md:w-auto"
                      onClick={() => handleEdit()}
                    >
                      แก้ไข
                    </Button>
                  </div>
                )}

                <div className="w-full md:w-auto">
                  {/*{
              data.workOrderStatusCode === 'O' ?
                <Button className="rounded-full text-white bg-[#671FAB] hover:bg-[#671FAB] cursor-pointer w-full md:w-auto"
                        onClick={() => handleRecordResult()}
                >
                  บันทึกผล
                </Button>
                : data.workOrderStatusCode === 'M' ?
                  <Button className="rounded-full text-white bg-[#671FAB] hover:bg-[#671FAB] cursor-pointer w-full md:w-auto"
                          onClick={() => handleConfirmStart()}
                  >
                    เริ่มปฏิบัติงาน
                  </Button>
                  : ''
            }*/}
                  {data.workOrderStatusCode === "M" && (
                    <Button
                      className="rounded-full text-white bg-[#671FAB] hover:bg-[#671FAB] cursor-pointer w-full md:w-auto"
                      onClick={() => handleConfirmStart()}
                    >
                      เริ่มปฏิบัติงาน
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : <div></div>
      }

      <ModalConfirm
        open={isShowConfirmStart}
        onCancel={() => setIsShowConfirmStart(false)}
        onSubmit={submitConfirmStart}
        confirmText="เริ่มปฏิบัติงาน"
        title="เริ่มปฏิบัติงาน?"
        message="ท่านต้องการเริ่มปฏิบัติงาน ‘ใช่ หรือ ไม่’ "
        icon={
          <div className="relative">
            <img
              src={PopupStartWork.src}
              alt="start work image"
              className="w-[120px] h-[110px]"
            />
          </div>
        }
      />

      <ModalReferenceData
        open={refType !== null}
        onClose={() => setRefType(null)}
        workOrderType={refType}
        id={id}
      />

      <ModalRelationWorkOrder
        open={showWorkOrderRelation}
        onClose={() => setShowWorkOrderRelation(false)}
        id={id}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        id={id}
      />

      <ModalCancelWorkOrder open={showCancelWorkOrder}
                            onClose={() => setShowCancelWorkOrder(false)}
                            id={id}
      />
    </div>
  );
};

export default WorkOrderDetail;
