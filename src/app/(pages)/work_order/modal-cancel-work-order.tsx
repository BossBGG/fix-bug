import Modal from "@/app/layout/Modal";
import InputTextArea from "@/app/components/form/InputTextArea";
import {useEffect, useState} from "react";
import {showError, showProgress, showSuccess, dismissAlert} from "@/app/helpers/Alert";
import {cancelWorkOrder} from "@/app/api/WorkOrderApi";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {useOnlineStatus} from "@/hooks/useOnlineStatus";
import {offlineSyncService} from "@/services/offlineSync";

interface ModalCancelWorkOrderProps {
  open: boolean
  onClose: () => void,
  id: string
}

const ModalCancelWorkOrder = ({
                                open,
                                onClose,
                                id
                              }: ModalCancelWorkOrderProps) => {
  const [note, setNote] = useState<string>("");
  const router = useRouter()
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    setNote("")
  }, [open]);

  const submitCancelled = async () => {
    try {
      showProgress()
      
      if (isOnline) {
        const res = await cancelWorkOrder(id, {note})
        dismissAlert()
        
        if(res.status === 200) {
          if(res.data.error) {
            onClose()
            showError(res.data.message || "")
          }else {
            onClose()
            showSuccess("ยกเลิกใบสั่งงานสำเร็จ").then(() => {
              router.push('/work_order')
            })
          }
        }
      } else {
        await offlineSyncService.saveCancelWorkOrderOffline(id, { note })
        dismissAlert()
        onClose()
        showSuccess("บันทึกการยกเลิกใบสั่งงานในโหมดออฟไลน์สำเร็จ ข้อมูลจะถูกซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต").then(() => {
          router.push('/work_order')
        })
      }
    } catch (e) {
      dismissAlert()
      showError("เกิดข้อผิดพลาดในการยกเลิกใบสั่งงาน")
    }
  }

  const ModalFooter = () => {
    return (
      <div className="flex justify-center w-full">
        <button onClick={onClose}
                className="text-[#a6a6a6] border-1 border-[#a6a6a6] rounded-md px-10 py-2 mr-3 cursor-pointer">
          ปิด
        </button>
        <button className={
          cn(
            'text-white bg-[#671FAB] py-2 px-3 rounded-md cursor-pointer',
            !note && '!cursor-default bg-gray-400'
            )
        }
                onClick={() => submitCancelled()}
                disabled={!note}
        >
          ยืนยันยกเลิกใบสั่งงาน
        </button>
      </div>
    )
  }

  return (
    <Modal title={"ต้องการยกเลิกใบสั่งงานหรือไม่ ?"}
           open={open}
           onClose={onClose}
           footer={<ModalFooter/>}
    >
      <div>
        {!isOnline && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 text-yellow-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                โหมดออฟไลน์: ข้อมูลจะถูกบันทึกและซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต
              </span>
            </div>
          </div>
        )}
        <InputTextArea data={note} onChange={setNote}/>
      </div>
    </Modal>
  )
}

export default ModalCancelWorkOrder;
