import { NotificationObj } from "@/app/api/NotificationApi";
import { formatJSDateTH } from "@/app/helpers/DatetimeHelper";
import { useAppSelector } from "@/app/redux/hook";
import { Checkbox } from "@/components/ui/checkbox";
import {
  faArrowUpRightFromSquare,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Link from "next/link";
import {MOBILE_SCREEN, TABLET_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

const getTypeBadge = (type: string) => {
  const typeMap: { [key: string]: { bg: string; text: string; label: string } } = {
    WORKORDER_NEW: { bg: "#BEE2FF", text: "#000000", label: "ใบสั่งงานใหม่" },
    WORKORDER_RECORDED: { bg: "#E1D2FF", text: "#671FAB", label: "บันทึกใบสั่งงาน" },
    WORKORDER_COMPLETED: { bg: "#C8F9E9", text: "#000000", label: "เสร็จสิ้นใบสั่งงาน" },
    WORKORDER_APPROVED: { bg: "#C8F9E9", text: "#000000", label: "อนุมัติใบสั่งงาน" },
    WORKORDER_REJECTED: { bg: "#FFD4D4", text: "#000000", label: "ปฏิเสธใบสั่งงาน" },
    WORKORDER_CANCELLED: { bg: "#FFD4D4", text: "#000000", label: "ยกเลิกใบสั่งงาน" },
    SURVEY_NEW: { bg: "#FDE5B6", text: "#000000", label: "แบบสำรวจใหม่" },
    SURVEY_SUCCESS: { bg: "#C8F9E9", text: "#000000", label: "สำรวจงานสำเร็จ" },
    SURVEY_FAILED: { bg: "#FFD4D4", text: "#000000", label: "สำรวจไม่สำเร็จ" },
    SURVEY_CANCELLED: { bg: "#FFD4D4", text: "#000000", label: "ยกเลิกแบบสำรวจ" },
  };

  const style = typeMap[type] || { bg: "#E1D2FF", text: "#671FAB", label: type };

  return (
    <div
      className="inline-block text-center px-2 py-1 rounded-full text-[12px] font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </div>
  );
};

interface ListDataContentProps {
  item: NotificationObj;
  onCheck: (checked: boolean, id: string) => void;
}

const ListDataContent: React.FC<ListDataContentProps> = ({ item, onCheck }) => {
  const screenSize = useAppSelector((state) => state.screen_size);
  const href = item.actionPath || (item.actionType === 'WORK_ORDER' && item.actionId ? `/work_order/${item.actionId}` : null);

  return (
    <div className={`border-1 border-[#E0E0E0] rounded-[12px] p-3 mb-3 text-[14px] transition-colors duration-200 ${
      !item.isRead ? 'bg-[#F3E8FF]' : 'bg-white'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <Checkbox
          onCheckedChange={(check: boolean) => onCheck(check, item.id)}
          className="border-[#9538EA] data-[state=checked]:border-none data-[state=checked]:bg-[#9538EA] cursor-pointer mt-1 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="text-[#160C26] text-[12px] mb-1">
            วันที่: {formatJSDateTH(new Date(item.sentAt), "dd MMMM yyyy")}{" "}
            เวลา: {formatJSDateTH(new Date(item.sentAt), "HH:mm น.")}
          </div>

          {item.title && (
            <p className="text-[#160C26] font-medium mb-1 break-words">
              {item.title}
            </p>
          )}
          <p className="text-[#4A4A4A] mb-2 break-words text-[12px]">
            {item.message}
          </p>

          {screenSize === MOBILE_SCREEN && (
            <div className="flex items-center justify-between gap-2 ">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[#4A4A4A] text-[12px] flex-shrink-0">
                  ประเภท:
                </span>
                {getTypeBadge(item.type)}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {href && (
                  <Link
                    href={href}
                    className="bg-[#BEE2FF] rounded-[8px] p-2 flex items-center justify-center hover:bg-[#BEE2FF]/80"
                  >
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      size="sm"
                      color="#03A9F4"
                    />
                  </Link>
                )}
                <button
                  onClick={async () => {
                    const { showConfirm } = await import('@/app/helpers/Alert');
                    const isConfirm = await showConfirm('คุณต้องการลบรายการนี้หรือไม่?');
                    if (isConfirm) {
                      const { deleteNotification } = await import('@/app/api/NotificationApi');
                      await deleteNotification(item.id);
                      window.location.reload();
                    }
                  }}
                  className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center hover:bg-[#FFD4D4]/80"
                >
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    size="sm"
                    color="#E02424"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
        {screenSize === TABLET_SCREEN && (
          <div className="flex items-center justify-between gap-2 ">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[#4A4A4A] text-[12px] flex-shrink-0">
                ประเภท:
              </span>
              {getTypeBadge(item.type)}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {href && (
                <Link
                  href={href}
                  className="bg-[#BEE2FF] rounded-[8px] p-2 flex items-center justify-center hover:bg-[#BEE2FF]/80"
                >
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    size="sm"
                    color="#03A9F4"
                  />
                </Link>
              )}
              <button
                onClick={async () => {
                  const { showConfirm } = await import('@/app/helpers/Alert');
                  const isConfirm = await showConfirm('คุณต้องการลบรายการนี้หรือไม่?');
                  if (isConfirm) {
                    const { deleteNotification } = await import('@/app/api/NotificationApi');
                    await deleteNotification(item.id);
                    window.location.reload();
                  }
                }}
                className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center hover:bg-[#FFD4D4]/80"
              >
                <FontAwesomeIcon icon={faTrashCan} size="sm" color="#E02424" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDataContent;
