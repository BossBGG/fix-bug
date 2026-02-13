"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faEnvelope,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux/hook";
import { fetchLatestUnread, fetchUnreadCount, markAllAsRead, markAsRead } from "@/app/redux/slices/notificationSlice";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import type { NotificationObj } from "@/types/notification";

const getNotificationHref = (notification: Pick<NotificationObj, 'actionPath' | 'actionType' | 'actionId'>): string | null => {
  if (notification.actionPath) return notification.actionPath;
  if (notification.actionType === 'WORK_ORDER' && notification.actionId) return `/work_order/${notification.actionId}`;
  return null;
};

const NotificationHeader = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { latestUnread, unreadCount, loadingUnread } = useAppSelector((state) => state.notification);
  const user = useAppSelector((state) => state.user);
  const viewMode = user.type === 'VENDOR_USER' ? 'SELF' : 'ALL';

  useEffect(() => {
    dispatch(fetchUnreadCount(viewMode));
    dispatch(fetchLatestUnread({ viewMode }));
    
    // Listen for new notifications
    const handleNewNotification = () => {
      dispatch(fetchUnreadCount(viewMode));
      dispatch(fetchLatestUnread({ viewMode }));
    };
    
    window.addEventListener('notification-received', handleNewNotification);
    return () => window.removeEventListener('notification-received', handleNewNotification);
  }, [dispatch, viewMode]);

  const handleViewAll = () => {
    setOpen(false);
    router.push("/notifications");
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount <= 0) return;
    await dispatch(markAllAsRead());
    dispatch(fetchLatestUnread({ viewMode }));
  };

  const handleNotificationClick = async (notification: NotificationObj) => {
    if (!notification.isRead) {
      await dispatch(markAsRead(notification.id));
    }
    setOpen(false);
    const href = getNotificationHref(notification);
    if (href) router.push(href);
  };

  return (
    <>
      <div
        className="hover:bg-[#E1D2FF]  px-4 py-3 rounded-full relative mr-3 cursor-pointer transform duration-150 "
        onClick={() => setOpen(true)}
      >
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-[#FF3700] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
            {unreadCount}
          </div>
        )}
        <FontAwesomeIcon icon={faBell} size="lg" color="#671FAB" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[500px] max-w-[95vw] max-h-[80vh] p-0 flex flex-col"
          showCloseButton={false}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[20px] font-bold text-[#160C26]">
                รายการแจ้งเตือน
                {unreadCount > 0 && (
                  <span className="ml-2 bg-[#FF3700] text-white rounded-full px-2 py-[1] text-[12px]">
                    {unreadCount}
                  </span>
                )}
              </DialogTitle>
              <button
                onClick={() => setOpen(false)}
                className="hover:bg-gray-100 rounded-full px-2 py-1"
              >
                <FontAwesomeIcon icon={faXmark} size="lg" />
              </button>
            </div>
            <div className="flex flex-row text-[14px] text-[#4A4A4A] font-normal mt-2 justify-between gap-2">
              ข้อความใหม่
              <button 
                onClick={handleMarkAllAsRead}
                disabled={latestUnread.length === 0}
                className="flex text-[#671FAB] underline gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                อ่านทั้งหมด
                <FontAwesomeIcon icon={faEnvelope} color="#671FAB" size="lg" className="mt-1"/>
              </button>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-6">
            {loadingUnread ? (
              <div className="p-4 text-center text-[#4A4A4A]">กำลังโหลด...</div>
            ) : latestUnread.length === 0 ? (
              <div className="p-4 text-center text-[#4A4A4A]">ไม่มีการแจ้งเตือนใหม่</div>
            ) : (
              latestUnread.map((notification) => {
                const href = getNotificationHref(notification);
                const isNavigable = !!href;

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b rounded-lg last:border-b-0 transition-colors duration-200 mb-2 ${
                      !notification.isRead ? 'bg-[#F3E8FF]' : 'bg-white'
                    } ${isNavigable ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="font-medium text-[14px] flex-1 min-w-0">
                        {notification.title}
                      </div>
                      <div className="text-[12px] text-[#4A4A4A] whitespace-nowrap flex-shrink-0">
                        {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true, locale: th })}
                      </div>
                    </div>
                    {notification.workOrderNo && (
                      <div className="text-[12px] text-[#4A4A4A] mb-2">
                        เลขที่คำร้อง : {notification.workOrderNo}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[12px] text-[#4A4A4A]">ประเภท:</span>
                      {(() => {
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
                        const style = typeMap[notification.type] || { bg: "#E1D2FF", text: "#671FAB", label: notification.type };
                        return (
                          <div 
                            className="inline-block px-2 py-1 rounded-full text-[12px] font-medium"
                            style={{ backgroundColor: style.bg, color: style.text }}
                          >
                            {style.label}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-[12px] text-[#4A4A4A] mt-2">
                      {notification.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-6 py-4 border-t flex-shrink-0">
            <button
              onClick={handleViewAll}
              className="w-full bg-[#671FAB] hover:bg-[#671FAB]/90 text-white rounded-full py-3 font-medium"
            >
              ดูแจ้งเตือนทั้งหมด
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationHeader;
