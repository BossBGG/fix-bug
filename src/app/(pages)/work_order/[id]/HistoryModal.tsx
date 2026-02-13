"use client";

import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faUser,
  faTrash,
  faFileCirclePlus,
  faFileEdit
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@/app/layout/Modal";
import {getLogWorkOrderHistory} from "@/app/api/SystemLogApi";
import {WorkOrderHistory} from "@/types";
import {format} from "date-fns";
import {th} from "date-fns/locale";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

const HistoryModal: React.FC<HistoryModalProps> = ({isOpen, onClose, id}) => {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CREATED':
        return faFileCirclePlus;
      case 'DELETED':
        return faTrash;
      case 'UPDATED':
        return faFileEdit;
      default:
        return faEdit;
    }
  };

  const [historyData, setHistoryData] = useState<WorkOrderHistory[]>([])
  const actionTypeMap: any = {
    'CREATED': 'สร้างใบสั่งงาน',
    'DELETED': 'ยกเลิกใบสั่งงาน',
    'UPDATED': 'แก้ไขใบสั่งงาน',
  }

  useEffect(() => {
    if (isOpen) {
      getLogWorkOrderHistory(id).then((res) => {
        setHistoryData(res.data.data || [])
      })
    }
  }, [isOpen])

  return (
    <Modal
      title="ประวัติการแก้ไข"
      open={isOpen}
      onClose={onClose}
      classContent="max-w-2xl"
    >
      <div className="overflow-x-hidden max-h-[60vh] min-h-[120px]">
        {
          historyData?.length === 0 ? (
              <div className="text-center text-gray-500 py-4">ไม่พบประวัติการแก้ไข</div>
            )
            :
            <div className="relative py-2">
              {/* Timeline line */}
              <div className="absolute left-5.5 top-16 rounded-full bottom-0 w-1.5 bg-[#D0BAE5]"></div>

              {
                historyData.map((item, index) => (
                  <div key={index} className="relative flex items-start mb-8 last:mb-0">
                    {/* Timeline dot */}
                    <div
                      className="flex-shrink-0 w-12 h-12 bg-[#F4EEFF] rounded-full flex items-center justify-center relative z-10">
                      <FontAwesomeIcon
                        icon={getActionIcon(item.logType)}
                        className="text-[#671FAB] text-sm"
                      />
                    </div>

                    {/* Content */}
                    <div className="ml-6 flex-1">
                      <div
                        className="text-sm text-gray-500 mb-1">{format(item.createdAt, 'dd MMMM y, HH:mm น.', {locale: th})}</div>
                      <div className="font-medium text-[#160C26] mb-1">{actionTypeMap[item.logType]}</div>
                      <div className="text-gray-600 mb-2">{item.detail}</div>
                      <div className="flex items-center">
                        <div
                          className="text-sm text-gray-500 w-8 h-8 bg-[#F4EEFF] rounded-full flex items-center justify-center me-2">
                          <FontAwesomeIcon icon={faUser} className="text-[#671FAB]"/>
                        </div>
                        <span>{item.userName}</span>
                      </div>

                      {
                        item.logType === 'DELETED' && item.cancelNote &&
                        (
                          <div className="mt-2 p-3 mr-2 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-xs text-red-600 font-medium mb-1">เหตุผลที่ยกเลิก</div>
                            <div className="text-sm text-red-800">{item.cancelNote}</div>
                          </div>
                        )
                      }
                    </div>
                  </div>
                ))
              }
            </div>
        }
      </div>
    </Modal>
  );
};

export default HistoryModal;
