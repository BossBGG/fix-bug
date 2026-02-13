import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PopupConfirm from "@/assets/images/popup_confirm.png";
import PopupStartwork from "@/assets/images/popup_startwork.png";
import { ModalConfirm } from "@/app/components/utils/ModalConfirm";
import PopupCancelSync from "@/assets/images/notification_popup_cancel_sync.png";
import PopupCancelNoti from "@/assets/images/notification_popup__cancel.png";
import PopupSuccessNoit from "@/assets/images/notification_popup__success.png";
import PopupDeleteNoit from "@/assets/images/notification_popup_delete.png";
import PopupNoAlerts from "@/assets/images/notification_no_alerts.png";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onViewAllNotification?: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  itemCount?: number;
}

const Popup: React.FC<PopupProps> = ({
  open,
  onClose,
  onConfirm,
  onViewAllNotification,
  title,
  message,
  confirmText,
  cancelText,
  icon,
  showHeader = false,
  headerTitle,
  headerSubtitle,
  itemCount,
}) => {
  const hasCancelButton = cancelText !== undefined;
  const hasConfirmButton = confirmText !== undefined;
  const hasAnyButton = hasCancelButton || hasConfirmButton;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6" showCloseButton={true}>
        {showHeader && (
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[20px] font-bold text-[#160C26]">
                {headerTitle}
              </DialogTitle>
            </div>
            {headerSubtitle && (
              <div className="text-[14px] text-[#4A4A4A] font-normal mt-2 text-left">
                {headerSubtitle}
              </div>
            )}
          </DialogHeader>
        )}

        <div className="flex flex-col mt-6 mb-2 items-center text-center space-y-4 ">
          {/* Icon */}
          {icon && (
            <div className="w-20 h-20 flex items-center justify-center">
              {icon}
            </div>
          )}

          {/* Title */}

          <DialogTitle className="text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>

          {/* Message */}
          {message && <p className="text-gray-600 text-sm">{message}</p>}

          {/* Buttons */}
          {hasAnyButton && (
            <div
              className={`w-full ${
                hasCancelButton && hasConfirmButton ? "flex flex-row gap-4" : ""
              }`}
            >
              {hasCancelButton && (
                <div className="w-full">
                  <Button
                    onClick={onClose}
                    className="w-full bg-[#FFFFFF] hover:bg-gray-50 border-2 border-[#671FAB] text-[#671FAB] rounded-full py-3"
                  >
                    {cancelText}
                  </Button>
                </div>
              )}

              {hasConfirmButton && (
                <div className="w-full">
                  <Button
                    onClick={onConfirm || onViewAllNotification}
                    className="w-full bg-[#671FAB] hover:bg-[#671FAB]/90 text-white rounded-full py-3"
                  >
                    {confirmText}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Pre-configured popup variants
export const ConfirmCreateWorkOrderPopup: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  const icon = (
    <div className="relative">
      <img src={PopupConfirm.src} alt="" className="w-24 h-20" />
    </div>
  );

  return (
    <ModalConfirm
      open={open}
      onCancel={onClose}
      onSubmit={onConfirm}
      title="ยืนยันสร้างใบสั่งงาน?"
      message="ท่านต้องการยืนยันการสร้างใบสั่งงานนี้หรือไม่?"
      confirmText="ยืนยัน"
      icon={icon}
    />
  );
};

export const StartWorkPopup: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  const icon = (
    <div className="relative">
      <img src={PopupStartwork.src} alt="" className="w-24 h-20" />
    </div>
  );

  return (
    <Popup
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="เริ่มปฏิบัติงาน?"
      message="ท่านต้องการเริ่มปฏิบัติงาน 'ใช่ หรือ ไม่' "
      confirmText="เริ่มปฏิบัติงาน"
      icon={icon}
    />
  );
};

export const EndWorkPopup: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  const icon = (
    <div className="relative">
      <img src={PopupConfirm.src} alt="" className="w-24 h-20" />
    </div>
  );

  return (
    <ModalConfirm
      open={open}
      onCancel={onClose}
      onSubmit={onConfirm}
      title="ยืนยันการจบงาน ใช่หรือไม่?"
      message="เมื่อทำการจบงานจะไม่สามารถแก้ไขข้อมูลได้อีก !"
      confirmText="จบงาน"
      icon={icon}
    />
  );
};

export const SyncFailedPopup: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  const icon = (
    <div className="relative">
      <img src={PopupCancelSync.src} alt="" className="w-24 h-20" />
    </div>
  );

  return (
    <Popup
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Sync ข้อมูลไม่สำเร็จ"
      message="กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองใหม่อีกครั้ง"
      confirmText="ยืนยัน"
      icon={icon}
    />
  );
};

export const NotificationCancelPopup: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const icon = (
    <div className="relative">
      <img src={PopupCancelNoti.src} alt="" className="w-24 h-20" />
    </div>
  );
  return (
    <Popup
      open={open}
      onClose={onClose}
      title="ทำรายการ ไม่สำเร็จ!"
      icon={icon}
    />
  );
};

export const NotificationSuccessPopup: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const icon = (
    <div className="relative">
      <img src={PopupSuccessNoit.src} alt="" className="w-24 h-20" />
    </div>
  );
  return (
    <Popup open={open} onClose={onClose} title="ทำรายการ สำเร็จ!" icon={icon} />
  );
};

export const NotificationDeletePopup: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  const icon = (
    <div className="relative">
      <img src={PopupDeleteNoit.src} alt="" className="w-24 h-20" />
    </div>
  );

  return (
    <Popup
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="ต้องการลบ ใช่หรือไม่?"
      confirmText="ยืนยัน"
      cancelText="ยกเลิก"
      icon={icon}
    />
  );
};

export const NoAlertsPopup: React.FC<{
  open: boolean;
  onClose: () => void;
  onViewAllNotification: () => void;
}> = ({ open, onClose, onViewAllNotification }) => {
  const icon = (
    <div className="relative">
      <img src={PopupNoAlerts.src} alt="" className="w-24 h-20" />
    </div>
  );
  const handleViewAll = () => {
    onViewAllNotification();
  };

  return (
    <Popup
      open={open}
      onClose={onClose}
      onViewAllNotification={handleViewAll}
      title="ต้องการลบ ใช่หรือไม่?"
      confirmText="ดูแจ้งเตือนทั้งหมด"
      icon={icon}
      showHeader={true}
      headerTitle="รายการแจ้งเตือน"
      headerSubtitle="ข้อความใหม่"
    />
  );
};

export const ConfirmCompleteWork: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}> = ({ open, onClose, onConfirm, count }) => {
  const icon = (
    <div className="relative">
      <img src={PopupConfirm.src} alt="" className="w-24 h-20" />
    </div>
  );

  return (
    <Popup
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="ยืนยันจบใบสั่งงาน ใช่หรือไม่?"
      message={`จบงานจำนวน ${count} ใบ`}
      confirmText="ยืนยัน"
      cancelText="ยกเลิก"
      icon={icon}
    />
  );
};

export const CompleteWork: React.FC<{
  open: boolean;
  onClose: () => void;
  message: string;
}> = ({ open, onClose, message }) => {
  const icon = (
    <div className="relative">
      <img src={PopupSuccessNoit.src} alt="" className="w-24 h-20" />
    </div>
  );

  return (
    <Popup
      open={open}
      onClose={onClose}
      title={`จบงานสำเร็จ`}
      message={message}
      icon={icon}
    />
  );
};

export const FailedCompleteWork: React.FC<{
  open: boolean;
  onClose: () => void;
  message: string
}> = ({ open, onClose, message }) => {
  const icon = (
    <div className="relative">
      <img src={PopupCancelNoti.src} alt="" className="w-24 h-20" />
    </div>
  );

  return (
    <Popup
      open={open}
      onClose={onClose}
      title="ไม่สามารถจบงานได้"
      icon={icon}
      message={message}
    />
  );
};
export default Popup;
