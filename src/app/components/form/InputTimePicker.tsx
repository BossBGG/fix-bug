import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimePickerInputProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function InputTimePicker({ date, setDate }: TimePickerInputProps) {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value; // ค่าที่ได้จะมีรูปแบบ "HH:mm" เช่น "14:30"
    if (!timeValue) return;

    const newDate = date ? new Date(date) : new Date();
    const [hours, minutes] = timeValue.split(':').map(Number);

    if (!isNaN(hours)) {
      newDate.setHours(hours);
    }
    if (!isNaN(minutes)) {
      newDate.setMinutes(minutes);
    }

    // ตั้งค่าวินาทีและมิลลิวินาทีเป็น 0 เพื่อความแม่นยำ
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    setDate(newDate);
  };

  // จัดรูปแบบค่าเวลาให้อยู่ในรูปแบบ "HH:mm" สำหรับ input
  const timeValue = date
    ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    : '';

  return (
    <div className="p-3 pt-2">
      <Label htmlFor="time-input" className="mb-3 block">
        เวลา
      </Label>
      <Input
        id="time-input"
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        className="w-full"
      />
    </div>
  );
}
