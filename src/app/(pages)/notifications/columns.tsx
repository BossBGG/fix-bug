"use client";

import { NotificationObj } from "@/app/api/NotificationApi";
import { formatJSDateTH } from "@/app/helpers/DatetimeHelper";
import { Checkbox } from "@/components/ui/checkbox";
import {
  faArrowUpRightFromSquare,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const getColumns = (
  onCheck: (checked: boolean, id: string) => void,
  selectedIds: string[]
): ColumnDef<NotificationObj>[] => [
  {
    accessorKey: "id",
    header: "",
    cell: ({ row }) => {
      const notificationId = row.original.id;
      const isSelected = selectedIds.includes(notificationId);
      return (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(check) => {
            console.log("Checkbox changed:", { check, notificationId });
            onCheck(!!check, notificationId);
          }}
          className="border-[#9538EA] data-[state=checked]:border-none data-[state=checked]:bg-[#9538EA] cursor-pointer"
        />
      );
    },
    enableSorting: false,
    minSize: 5,
    maxSize: 5,
  },
  {
    accessorKey: "sentAt",
    header: "วันที่",
    cell: ({ row }) => {
      return (
        <div>
          <div className="mb-1">
            {formatJSDateTH(
              new Date(row.getValue("sentAt")),
              "dd MMMM yyyy"
            )}
          </div>
          <div className="text-[#4A4A4A] text-[12px]">
            {formatJSDateTH(new Date(row.getValue("sentAt")), "HH:mm น.")}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "notificationType",
    accessorKey: "type",
    header: "ประเภท",
    cell: ({ row }) => {
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
      const type = row.getValue("notificationType") as string;
      const style = typeMap[type] || { bg: "#E1D2FF", text: "#671FAB", label: type };
      return (
        <div 
          className="inline-block px-3 py-1 rounded-full text-[12px] font-medium"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {style.label}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "title",
    header: "หัวข้อ",
    cell: ({ row }) => {
      return <div className="text-wrap font-medium">{row.getValue("title") || "-"}</div>;
    },
    enableSorting: true,
  },
  {
    id: "body",
    accessorKey: "message",
    header: "รายละเอียด",
    cell: ({ row }) => {
      return <div className="text-wrap text-[#4A4A4A]">{row.original.message || "-"}</div>;
    },
    size: 300,
    enableSorting: true,
  },
  {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const notification = row.original;
      const href =
        notification.actionPath ||
        (notification.actionType === 'WORK_ORDER' && notification.actionId
          ? `/work_order/${notification.actionId}`
          : null);
      
      return (
        <div className="flex justify-center">
          {href && (
            <Link
              className="bg-[#BEE2FF] rounded-[8px] mr-2 p-2 flex items-center justify-center cursor-pointer"
              href={href}
            >
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                size={"sm"}
                color="#03A9F4"
              />
            </Link>
          )}
          <button
            className="bg-[#FFD4D4] rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
            onClick={async () => {
              const { showConfirm } = await import('@/app/helpers/Alert');
              const { deleteNotification } = await import('@/app/api/NotificationApi');
              const isConfirm = await showConfirm('คุณต้องการลบรายการนี้หรือไม่?');
              if (isConfirm) {
                await deleteNotification(notification.id);
                window.location.reload();
              }
            }}
          >
            <FontAwesomeIcon icon={faTrashCan} size={"sm"} color="#E02424" />
          </button>
        </div>
      );
    },
    enableSorting: false,
    maxSize: 5,
    minSize: 36,
  },
];
