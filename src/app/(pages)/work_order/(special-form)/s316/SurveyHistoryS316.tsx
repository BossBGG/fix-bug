import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faCopy,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import {
  ElectricGeneratorObj,
  S314ServiceData,
  S316GeneratorElectric,
  S316GeneratorServiceData,
  S316ServiceData,
  S316SurveyData,
  Survey,
  WorkOrderObj,
} from "@/types";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import InputDateRange from "@/app/components/form/InputDateRange";
import { DateRange } from "react-day-picker";
import { showSuccess } from "@/app/helpers/Alert";
import { Button } from "@/components/ui/button";
import { InputTimeRange } from "@/app/components/form/InputTimeRange";
import { getServiceGenerator } from "@/app/api/ServicesApi";
import { useAppSelector } from "@/app/redux/hook";
import { Map, MapPin, Plus } from "lucide-react";
import SelectionDialog from "./SelectionDialog";
import StationDialog from "./StationDialog";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface ElectricGeneratorSurveyProps {
  generator?: any;
  modelOpenDialog?: boolean;
  defaultSelectSize?: string;
  selectable?: boolean;
  title?: string;

  data: Survey;
  updateData: (data: Survey) => void;
  disabled?: boolean;
}

type GeneratorItem = {
  id: number;
  pea_name: string;
  distance: number;
  tel_number: string;
};

const TextCopyToClipboard = ({ text }: { text: string }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      await showSuccess("คัดลอกแล้ว");
    } catch (err) {
      console.error("คัดลอกไม่สำเร็จ:", err);
    }
  };

  return (
    <div className="h-[65px] border-1 rounded-md p-2 flex justify-between items-center mt-2 ">
      <span className="flex-1">{text}</span>
      <Button
        className="bg-[#671FAB] hover:bg-[#671FAB] cursor-pointer border-[#671FAB] rounded-full text-[14px] h-[28px] shrink-0 ml-2"
        onClick={() => handleCopy()}
      >
        <FontAwesomeIcon icon={faCopy} />
        <div>คัดลอก</div>
      </Button>
    </div>
  );
};

type ElectricGeneratorPlace = {
  peaName: string;
  distance: number;
  disabled?: boolean;
};

const ElectricGeneratorPlace: React.FC<
  ElectricGeneratorPlace & { onEdit?: () => void }
> = ({ peaName, distance, disabled = false, onEdit }) => {
  return (
    <div className="h-[65px] border-1 p-2 mt-2 flex justify-between items-center rounded-md">
      <div className="flex-1 overflow-hidden">
        <div className="text-xs text-gray-500">การไฟฟ้าเจ้าของเครื่อง</div>
        <div className="truncate">{peaName}</div>
      </div>
      <div className="text-[#671FAB] text-[14px] mx-2 whitespace-nowrap">
        ระยะทาง : {distance}
      </div>
      {/*<Button
        className="bg-[#671FAB] hover:bg-[#671FAB] cursor-pointer border-[#671FAB] rounded-full text-[14px] h-[28px] shrink-0"
        onClick={onEdit}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faSignOut} />
        <div>เลือก</div>
      </Button>*/}
    </div>
  );
};

const SurveyHistoryS316 = ({
  data,
  updateData,
  disabled,
}: ElectricGeneratorSurveyProps) => {
  // State
  const [generators, setGenerators] = useState<GeneratorItem[]>([]);

  // Dialog States
  const [isStationViewOpen, setIsStationViewOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);

  const handleViewAvailable = () => {
    setIsAddMode(false);
    setIsStationViewOpen(true);
  };

  const handleAddItem = () => {
    setIsAddMode(true);
    setIsStationViewOpen(true);
  };

  const handleEditItem = (item: any) => {
    setCurrentEditItem(item);
    setIsSelectionOpen(true);
  };

  const handleSelectionConfirm = (data: any) => {
    setGenerators((prev) =>
      prev.map((g: any) =>
        g.id === currentEditItem.id ? { ...g, ...data } : g
      )
    );
  };

  const handleDeleteItem = (itemId: number) => {
    setGenerators((prev) => prev.filter((g) => g.id !== itemId));
  };

  const [electricGenerate, setElectricGenerate] = useState<S316SurveyData>(
    {} as S316SurveyData
  );
  const user = useAppSelector((state) => state.user);
  const [generatorElects, setGenerateElects] = useState<
    S316GeneratorElectric[]
  >([]);
  const initDate: DateRange = {
    from: undefined,
    to: undefined,
  };
  const [date, setDate] = useState<DateRange | undefined>(initDate);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  useEffect(() => {
    const surveySpecData = data.surveyData?.serviceSpecificData as S316SurveyData;

    // Set generators from survey data
    if (surveySpecData?.kw_size_reservation) {
      setGenerators(surveySpecData.kw_size_reservation);
    }

    // Set date and time from requests_serviceS316
    if (surveySpecData?.requests_serviceS316) {
      const requests = surveySpecData.requests_serviceS316;

      let dateFrom = requests.rental_startdate
        ? new Date(requests.rental_startdate as string)
        : undefined;
      let dateTo = requests.rental_enddate
        ? new Date(requests.rental_enddate as string)
        : undefined;
      setDate({
        from: dateFrom,
        to: dateTo,
      });

      let timeStart = requests.start_time || "";
      let timeEnd = requests.end_time || "";
      setStartTime(timeStart);
      setEndTime(timeEnd);
    }
  }, [data.surveyData]);

/*  useEffect(() => {
    getServiceGenerator(user.selectedPeaOffice).then((res) => {
      if (res.data.status_code === 200) {
        setGenerateElects(res.data.data || []);
      }
    });
  }, []);*/

  useEffect(() => {
    let serviceSpecData = data.surveyData?.serviceSpecificData as S316SurveyData;
    setElectricGenerate(serviceSpecData || ({} as S316SurveyData));
  }, [data.surveyData]);

  const handleDateChange = (value: DateRange | undefined) => {
    setDate(value);
    const surveySpecData = data.surveyData?.serviceSpecificData as S316SurveyData;
    updateData({
      ...data,
      surveyData: {
        ...data.surveyData,
        serviceSpecificData: {
          ...surveySpecData,
          requests_serviceS316: {
            ...surveySpecData?.requests_serviceS316,
            rental_startdate: value?.from?.toISOString() || undefined,
            rental_enddate: value?.to?.toISOString() || undefined,
          },
        } as S316SurveyData,
      },
    });
  };

  const handleTimeChange = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    const surveySpecData = data.surveyData?.serviceSpecificData as S316SurveyData;
    updateData({
      ...data,
      surveyData: {
        ...data.surveyData,
        serviceSpecificData: {
          ...surveySpecData,
          requests_serviceS316: {
            ...surveySpecData?.requests_serviceS316,
            start_time: start,
            end_time: end,
          },
        } as S316SurveyData,
      },
    });
  };

  return (
    <CardCollapse title={"รายการเครื่องที่ขอรับบริการ"}>
      <div className="flex flex-col ">
        <div className="flex justify-end items-center mb-2">
          <span
            className="text-purple-600 text-sm cursor-pointer hover:underline flex items-center gap-1"
            onClick={handleViewAvailable}
          >
            <Map className="w-4 h-4" /> ดูรายการเครื่องที่ว่าง
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-[33%]">
            <div className="w-full mb-3">
              <CustomTooltip
                fieldValue={date?.from && date?.to ? `${date.from.toLocaleDateString('th-TH')} - ${date.to.toLocaleDateString('th-TH')}` : ''}
                fieldLabel="วันที่ขอรับบริการ"
              >
                <InputDateRange
                  setData={handleDateChange}
                  data={date}
                  label="วันที่ขอรับบริการ"
                  disabled={disabled}
                />
              </CustomTooltip>
            </div>
            <div className="w-full">
              <div className="mb-3">
                ประมาณเวลาที่เริ่มต้น-สิ้นสุดที่ต้องการใช้งาน
              </div>
              <CustomTooltip
                fieldValue={startTime && endTime ? `${startTime} - ${endTime}` : ''}
                fieldLabel="ประมาณเวลาที่เริ่มต้น-สิ้นสุดที่ต้องการใช้งาน"
              >
                <InputTimeRange
                  onChange={handleTimeChange}
                  start={startTime}
                  end={endTime}
                  disabled={disabled}
                />
              </CustomTooltip>
            </div>
          </div>

          <div className="w-full lg:w-[67%]">
            {generators.map((item, index) => (
              <div
                key={item.id}
                className="w-full mb-3 flex flex-col md:flex-row gap-2"
              >
                <div className="w-full md:w-1/2">
                  <div className="flex flex-row items-center justify-start">
                    <span>
                      รายการที่ {index + 1}
                    </span>
                    {/*<Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-purple-500 hover:text-purple-700 hover:bg-red-50"
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={disabled}
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </Button>*/}
                  </div>
                  <ElectricGeneratorPlace
                    peaName={item.pea_name}
                    distance={item.distance}
                    disabled={disabled}
                    onEdit={() => handleEditItem(item)}
                  />
                </div>

                <div className="w-full md:w-1/2">
                  <div>เบอร์ติดต่อการไฟฟ้าเจ้าของเครื่อง</div>
                  <TextCopyToClipboard text={item.tel_number} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/*<div className="flex justify-center">
          <Button
            variant="ghost"
            className="w-[240px] border-2 border-dashed border-gray-300 text-gray-500 hover:border-purple-500 hover:text-purple-600 py-6 justify-center"
            onClick={handleAddItem}
          >
            <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการ
          </Button>
        </div>*/}

        {/* Dialogs */}
        <StationDialog
          open={isStationViewOpen}
          onClose={() => setIsStationViewOpen(false)}
          mode={isAddMode ? "select" : "view"}
          rentalStartDate={date?.from}
          rentalEndDate={date?.to}
          onSelect={(station) => {
            if (isAddMode) {
              const newItem: GeneratorItem = {
                id: Date.now(),
                pea_name: station.pea_name || station.peaName || "",
                distance: station.distance || 0,
                tel_number: station.tel_number || station.telNumber || "",
              };
              setGenerators([...generators, newItem]);
            }
          }}
        />

        <SelectionDialog
          open={isSelectionOpen}
          onClose={() => setIsSelectionOpen(false)}
          onConfirm={handleSelectionConfirm}
          mode="edit"
          initialData={currentEditItem}
        />
      </div>
    </CardCollapse>
  );
};

export default SurveyHistoryS316;
