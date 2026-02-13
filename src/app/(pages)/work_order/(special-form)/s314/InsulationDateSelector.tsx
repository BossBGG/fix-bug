import React, { useState, useEffect } from "react";
import InputDateButton from "@/app/components/form/InputDateButton";
import { Label } from "@/components/ui/label";

import { useAppSelector } from "@/app/redux/hook";
import { MOBILE_SCREEN } from "@/app/redux/slices/ScreenSizeSlice";
import {CustomTooltip} from "@/components/ui/custom-tooltip";

interface InsulationDateSelectorProps {
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  onDaysChange?: (days: number) => void;
  startDate?: Date;
  endDate?: Date;
}

const InsulationDateSelector: React.FC<InsulationDateSelectorProps> = ({
  onStartDateChange,
  onEndDateChange,
  onDaysChange,
  startDate,
  endDate,
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    startDate
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    endDate
  );
  const [totalDays, setTotalDays] = useState<number>(0);
  const screenSize = useAppSelector((state) => state.screen_size);

  // Calculate days between dates
  const calculateDays = (
    start: Date | undefined,
    end: Date | undefined
  ): number => {
    if (!start || !end) return 0;
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff > 0 ? daysDiff : 0;
  };

  useEffect(() => {
    const days = calculateDays(selectedStartDate, selectedEndDate);
    setTotalDays(days);
    onDaysChange?.(days);
  }, [selectedStartDate, selectedEndDate, onDaysChange]);

  const handleStartDateChange = (date: Date | undefined) => {
    setSelectedStartDate(date);
    onStartDateChange?.(date);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setSelectedEndDate(date);
    onEndDateChange?.(date);
  };

  // Mobile Layout
  if (screenSize === MOBILE_SCREEN) {
    return (
      <div className="p-4 border-1 mb-4 rounded-lg shadow-md">
        <div className="pb-4">วันที่เช่าฉนวนครอบสายไฟฟ้า</div>
        <div className="space-y-4">
          {/* วันที่เริ่มต้น */}
          <div>
            <CustomTooltip fieldValue={selectedStartDate?.toLocaleDateString('th-TH')} fieldLabel="วันที่เริ่มต้น">
              <InputDateButton
                label="วันที่เริ่มต้น"
                value={selectedStartDate}
                onChange={handleStartDateChange}
                placeholder="เลือกวันที่เริ่มต้น"
                className="w-full"
              />
            </CustomTooltip>
          </div>

          {/* วันที่สิ้นสุด */}
          <div>
            <CustomTooltip fieldValue={selectedEndDate?.toLocaleDateString('th-TH')} fieldLabel="วันที่สิ้นสุด">
              <InputDateButton
                label="วันที่สิ้นสุด"
                value={selectedEndDate}
                onChange={handleEndDateChange}
                placeholder="เลือกวันที่สิ้นสุด"
                className="w-full"
              />
            </CustomTooltip>
          </div>

          {/* จำนวนวัน */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              จำนวนวัน
            </Label>
            <div className="h-[44px] w-full rounded-md border border-[#D1D5DB] bg-gray-50 px-3 py-2 flex items-center">
              <span className="text-blue-600 font-medium">
                [ {totalDays} วัน ]
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="p-4 border-1 mb-4 rounded-lg shadow-md">
      <div className="pb-4">วันที่เช่าฉนวนครอบสายไฟฟ้า</div>
      <div className="grid grid-cols-3 gap-6 items-end">
        {/* วันที่เริ่มต้น */}
        <div>
          <InputDateButton
            label="วันที่เริ่มต้น"
            value={selectedStartDate}
            onChange={handleStartDateChange}
            placeholder="เลือกวันที่เริ่มต้น"
            className="w-full"
          />
        </div>

        {/* วันที่สิ้นสุด */}
        <div>
          <InputDateButton
            label="วันที่สิ้นสุด"
            value={selectedEndDate}
            onChange={handleEndDateChange}
            placeholder="เลือกวันที่สิ้นสุด"
            className="w-full"
          />
        </div>

        {/* จำนวนวัน */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">จำนวนวัน</Label>
          <div className="h-[44px] w-full rounded-md border border-[#D1D5DB] bg-gray-50 px-3 py-2 flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              [ {totalDays} วัน ]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsulationDateSelector;
