import { Input } from "@/components/ui/input";
import React, { ChangeEvent, useState } from "react";

type InputFormat =
  | "string"
  | "number"
  | "decimal"
  | "email"
  | "phone"
  | "latitude"
  | "longitude"
  | "coordinates"
  | "alphanumeric"
  | "none";

interface InputTextProps {
  label?: string;
  isRequired?: boolean;
  placeholder?: string;
  value: string | number;
  format?: InputFormat;
  numberOnly?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  align?: "left" | "center" | "right";
  maxLength?: number;
  type?: "text" | "password" | "email";
  labelUnit?: string;
  customValidation?: (value: string) => boolean;
  errorMessage?: string;
}

const InputText = ({
  label,
  isRequired = false,
  placeholder,
  value,
  format = "none",
  numberOnly = false,
  onChange,
  disabled = false,
  align = "left",
  maxLength = 255,
  type = "text",
  labelUnit,
  customValidation,
  errorMessage,
}: InputTextProps) => {
  const [internalError, setInternalError] = useState<string>("");

  const formatValidators = {
    string: (val: string) => /^[a-zA-Zัะาำิีึืุูเแโใไะๆ\s]*$/u.test(val),
    number: (val: string) => /^\d*$/.test(val),
    decimal: (val: string) => /^\d*(\.\d*)?$/.test(val),
    email: (val: string) => true,
    phone: (val: string) => {
      const numbers = val.replace(/\D/g, "");
      return numbers.length <= 10;
    },
    latitude: (val: string) => {
      if (val === "" || val === "-") return true;
      return /^-?\d*\.?\d*$/.test(val);
    },
    longitude: (val: string) => {
      if (val === "" || val === "-") return true;
      return /^-?\d*\.?\d*$/.test(val);
    },
    coordinates: (val: string) => {
      if (val === "") return true;
      return /^-?\d*\.?\d*,?\s*-?\d*\.?\d*$/.test(val);
    },
    alphanumeric: (val: string) => /^[a-zA-Z0-9]*$/.test(val),
    none: () => true,
  };

  const blurValidators = {
    email: (val: string) => {
      if (!val) return true; 
      return /^[^\s@]+@[^\s@]+\.com$/.test(val);
    },
    phone: (val: string) => {
      if (!val) return true;
      const numbers = val.replace(/\D/g, "");
      return numbers.length === 10;
    },
    latitude: (val: string) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    },
    longitude: (val: string) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    },
    coordinates: (val: string) => {
      if (!val) return true;
      const parts = val.split(",");
      if (parts.length !== 2) return false;
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      return (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    },
    string: () => true,
    number: () => true,
    decimal: () => true,
    alphanumeric: () => true,
    none: () => true,
  };

  const errorMessages = {
    email: "รูปแบบอีเมลไม่ถูกต้อง",
    phone: "เบอร์โทรศัพท์ต้องมี 10 หลัก",
    latitude: "ค่า Latitude ต้องอยู่ระหว่าง -90 ถึง 90",
    longitude: "ค่า Longitude ต้องอยู่ระหว่าง -180 ถึง 180",
    coordinates: "รูปแบบพิกัดไม่ถูกต้อง (ตัวอย่าง: 13.7563, 100.5018)",
    string: "กรุณากรอกข้อมูลให้ถูกต้อง",
    number: "กรุณากรอกตัวเลขเท่านั้น",
    decimal: "กรุณากรอกตัวเลขทศนิยม",
    alphanumeric: "กรุณากรอกตัวอักษรและตัวเลขเท่านั้น",
    none: "กรุณากรอกข้อมูลให้ถูกต้อง",
  };

  const formatTransformers = {
    phone: (val: string) => {
      const numbers = val.replace(/\D/g, "");
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6)
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      if (numbers.length <= 10)
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(
          6
        )}`;
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(
        6,
        10
      )}`;
    },
    coordinates: (val: string) => {
      return val.replace(/\s*,\s*/, ", ");
    },
  };

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    let inputValue = e.target.value;

    if (internalError) {
      setInternalError("");
    }

    if (format !== "none") {
      const validator = formatValidators[format];
      if (validator && !validator(inputValue)) {
        return;
      }
    }

    if (numberOnly && format === "none") {
      if (!/^\d*$/.test(inputValue)) {
        return;
      }
    }

    if (formatTransformers[format as keyof typeof formatTransformers]) {
      inputValue =
        formatTransformers[format as keyof typeof formatTransformers](
          inputValue
        );
    }

    onChange(inputValue);
  };

  const handleBlur = () => {
    const stringValue = String(value || "");

    if (isRequired && !stringValue.trim()) {
      setInternalError("กรุณากรอกข้อมูล");
      return;
    }

    if (!stringValue.trim() && !isRequired) {
      setInternalError("");
      return;
    }

    if (customValidation && !customValidation(stringValue)) {
      setInternalError(errorMessage || "ข้อมูลไม่ถูกต้อง");
      return;
    }

    if (format !== "none") {
      const validator = blurValidators[format];
      if (validator && !validator(stringValue)) {
        setInternalError(errorMessages[format]);
        return;
      }
    }

    setInternalError("");
  };

  const displayError = errorMessage || internalError;

  return (
    <div className="w-full">
      <div className={!label ? "hidden" : "text-[#111928] mb-3"}>
        {label}
        <span className={!isRequired ? "hidden" : "text-red-500 ml-1"}>*</span>
      </div>

      <div className="relative">
        <Input
          type={type}
          placeholder={placeholder}
          className={`h-[44px] text-${align} ${
            displayError ? "border-red-500" : ""
          } ${
            disabled ? "bg-gray-100" : "bg-white"
          }`}
          value={value || ""}
          onChange={handleChangeValue}
          onBlur={handleBlur}
          readOnly={disabled}
          maxLength={maxLength}
        />
        {labelUnit && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            {labelUnit}
          </span>
        )}

        {displayError && (
          <div className="text-xs text-red-500 mt-1">{displayError}</div>
        )}
      </div>
    </div>
  );
};

export default InputText;
