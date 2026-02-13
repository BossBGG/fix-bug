import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faSignOut } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import {
  ElectricGeneratorObj,
  S314ServiceData,
  S316GeneratorElectric,
  S316GeneratorServiceData,
  S316ServiceData,
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
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface ElectricGeneratorProps {
  data: WorkOrderObj;
  updateData: (data: WorkOrderObj) => void;
  disabled?: boolean;
}

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
    <div className="border-1 rounded-md p-2 flex justify-between items-center mt-2">
      {text}

      <Button
        className="bg-[#671FAB] hover:bg-[#671FAB] cursor-pointer border-[#671FAB] rounded-full text-[14px] h-[28px]"
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

const ElectricGeneratorPlace: React.FC<ElectricGeneratorPlace> = ({
  peaName,
  distance,
  disabled = false,
}) => {
  const handleSelect = () => {};

  return (
    <div className="border-1 p-2 mt-2 flex justify-between items-center rounded-md">
      <div>{peaName}</div>
      <div className="text-[#671FAB] text-[12px]">ระยะทาง : {distance}</div>
      <Button
        className="bg-[#671FAB] hover:bg-[#671FAB] cursor-pointer border-[#671FAB] rounded-full text-[14px] h-[28px]"
        onClick={() => handleSelect()}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faSignOut} />
        <div>เลือก</div>
      </Button>
    </div>
  );
};

const ElectricGenerator = ({
  data,
  updateData,
  disabled,
}: ElectricGeneratorProps) => {
  const [electricGenerate, setElectricGenerate] = useState<S316ServiceData>(
    {} as S316ServiceData
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
    let serviceSpecData = data.serviceSpecificData as S316ServiceData;
    let dateFrom = serviceSpecData?.generatorStartDate
      ? new Date(serviceSpecData?.generatorStartDate as string)
      : undefined;
    let dateTo = serviceSpecData?.generatorEndDate
      ? new Date(serviceSpecData?.generatorEndDate as string)
      : undefined;
    setDate({
      from: dateFrom,
      to: dateTo,
    });

    let timeStart = serviceSpecData?.generatorStartTime || "";
    let timeEnd = serviceSpecData?.generatorEndTime || "";
    setStartTime(timeStart);
    setEndTime(timeEnd);
  }, [data.serviceSpecificData]);

  useEffect(() => {
    getServiceGenerator(user.selectedPeaOffice).then((res) => {
      if (res.data.status_code === 200) {
        setGenerateElects(res.data.data || []);
      }
    });
  }, []);

  useEffect(() => {
    let serviceSpecData = data.serviceSpecificData as S316ServiceData;
    setElectricGenerate(serviceSpecData || ({} as S316ServiceData));
  }, [data.serviceSpecificData]);

  const handleDateChange = (value: DateRange | undefined) => {
    setDate(value);
    updateData({
      ...data,
      serviceSpecificData: {
        ...data.serviceSpecificData,
        generatorStartDate: value?.from?.toISOString() || undefined,
        generatorEndDate: value?.to?.toISOString() || undefined,
      } as S316ServiceData,
    });
  };

  const handleTimeChange = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    updateData({
      ...data,
      serviceSpecificData: {
        ...data.serviceSpecificData,
        generatorStartTime: start,
        generatorEndTime: end,
      } as S316ServiceData,
    });
  };

  return (
    <CardCollapse title={"เครื่องกำเนิดไฟฟ้า"}>
      <div className="flex flex-wrap">
        <div className="w-full md:w-[33%] px-3">
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

        <div className="w-full md:w-[67%] px-3">
          {generatorElects?.length > 0 &&
            generatorElects.map(
              (item: S316GeneratorElectric, index: number) => (
                <div key={index} className="w-full mb-3 flex flex-wrap">
                  <div className="w-full md:w-1/2">
                    <div>
                      เครื่อง {item.kwSize} : รายการที่ {index + 1}
                    </div>
                    <ElectricGeneratorPlace
                      peaName={item.peaName}
                      distance={item.distanceKm}
                      disabled={disabled}
                    />
                  </div>

                  <div className="w-full md:w-1/2">
                    <div>เบอร์ติดต่อการไฟฟ้าเจ้าของเครื่อง</div>
                    <TextCopyToClipboard text={item.telNumber} />
                  </div>
                </div>
              )
            )}
        </div>
      </div>
    </CardCollapse>
  );
};

export default ElectricGenerator;
