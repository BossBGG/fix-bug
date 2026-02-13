import { showError } from "@/app/helpers/Alert";

/**
 * Validates that end date/time is greater than start date/time
 * @param startDate - Start date/time
 * @param endDate - End date/time
 * @param showAlert - Whether to show alert message (default: true)
 * @returns true if validation passes, false otherwise
 */
export const validateDateTimeRange = (
  startDate: Date | string | undefined,
  endDate: Date | string | undefined,
  showAlert: boolean = true
): boolean => {
  if (!startDate || !endDate) {
    return true;
  }

  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  if (end <= start) {
    if (showAlert) {
      showError("วันที่และเวลาสิ้นสุดต้องมากกว่าวันที่และเวลาเริ่มต้น");
    }
    return false;
  }

  return true;
};

/**
 * Validates start date is less than end date
 * @param startDate - Start date/time
 * @param endDate - End date/time
 * @param showAlert - Whether to show alert message (default: true)
 * @returns true if validation passes, false otherwise
 */
export const validateStartDateBeforeEndDate = (
  startDate: Date | string | undefined,
  endDate: Date | string | undefined,
  showAlert: boolean = true
): boolean => {
  if (!startDate || !endDate) {
    return true;
  }

  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  if (start >= end) {
    if (showAlert) {
      showError("วันที่และเวลาเริ่มต้นต้องน้อยกว่าวันที่และเวลาสิ้นสุด");
    }
    return false;
  }

  return true;
};
