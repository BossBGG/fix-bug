import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft, faPrint} from "@fortawesome/free-solid-svg-icons";
import {useAppSelector} from "@/app/redux/hook";
import {
  ConfirmCreateWorkOrderPopup,
  StartWorkPopup,
  EndWorkPopup,
} from "@/components/ui/popup";
import {useRouter} from "next/navigation";
import {showError, showProgress, showPrompt, showSuccess, dismissAlert} from "@/app/helpers/Alert";
import {cancellableStatuses, completeWorkByWorkOrderNo} from "@/app/api/WorkOrderApi";
import {useOnlineStatus} from "@/hooks/useOnlineStatus";
import {offlineSyncService} from "@/services/offlineSync";
import {ApiResponse} from "@/app/api/Api";
import ModalCancelWorkOrder from "@/app/(pages)/work_order/modal-cancel-work-order";

interface WorkOrderActionButtonsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onComplete: () => void;
  onSave?: () => void;
  workOrderStatusCode: string;
  isEdit: boolean,
  isExecute: boolean,
  id: string
  workOrderNo: string
  disabled: boolean
}

const WorkOrderActionButtons: React.FC<WorkOrderActionButtonsProps> = ({
                                                                         currentStep,
                                                                         totalSteps,
                                                                         onNext,
                                                                         onCancel,
                                                                         onConfirm,
                                                                         onComplete,
                                                                         onSave,
                                                                         workOrderStatusCode,
                                                                         isEdit,
                                                                         isExecute,
                                                                         id,
                                                                         workOrderNo,
                                                                         disabled
                                                                       }) => {
  const router = useRouter();
  const { isOnline } = useOnlineStatus();
  const commonButtonClass = "h-[44px] px-6 font-medium w-full md:w-auto mb-3 md:mb-0";

  // Popup states
  const [showConfirmCreatePopup, setShowConfirmCreatePopup] = useState(false);
  const [showEndWorkPopup, setShowEndWorkPopup] = useState(false);
  const [showCancelWorkOrder, setShowCancelWorkOrder] = useState(false);

  // Handle confirm create work order
  const handleConfirmCreate = () => {
    setShowConfirmCreatePopup(true);
  };

  const handleConfirmCreateConfirm = () => {
    setShowConfirmCreatePopup(false);
    // Call the onConfirm prop to let parent handle navigation
    onConfirm();
  };

  const handleFinishWorkOrder = () => {
    setShowEndWorkPopup(true)
  };

  const handleConfirmFinishWorkOrder = async () => {
    setShowEndWorkPopup(false)
    showProgress()
    
    try {
      if (isOnline) {
        const res = await completeWorkByWorkOrderNo(workOrderNo)
        resSuccessOrError(res, "จบงานสำเร็จ")
      } else {
        await offlineSyncService.saveCompleteWorkOrderOffline([workOrderNo], false)
        dismissAlert()
        showSuccess("บันทึกการปิดงานในโหมดออฟไลน์สำเร็จ ข้อมูลจะถูกซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต").then(() => {
          router.push('/work_order')
        })
      }
    } catch (error) {
      dismissAlert()
      showError("เกิดข้อผิดพลาดในการปิดงาน")
    }
  }

  const handleCancelWorkOrder = () => {
    setShowCancelWorkOrder(true)
  };

  const resSuccessOrError = (res: ApiResponse, message: string) => {
    if(res.status === 200) {
      if(res.data.error) {
        showError(res.data.message || "")
      }else {
        showSuccess(message).then((res) => {
          router.push('/work_order')
        })
      }
    }
  }

  // Close all popups
  const closeAllPopups = () => {
    setShowConfirmCreatePopup(false);
    setShowEndWorkPopup(false);
  };

  // Determine button layout based on step
  const renderButtons = () => {
    // Step 1 and 2: ยกเลิก, บันทึก, ถัดไป
    return (
      <div className="flex flex-wrap justify-between items-center mt-6">
        {/* Left side - Back button */}
        <div className="flex items-center space-x-3 md:w-auto w-full">
          <Button
            className={`${commonButtonClass} cancel-button`}
            variant="outline"
            onClick={onCancel}
          >
            ยกเลิก
          </Button>
        </div>

        {/* Right side - Save, Create, Next, Finish */}
        <div className="flex flex-wrap items-center md:gap-3 gap-0 md:w-auto w-full">
          {
            cancellableStatuses.includes(workOrderStatusCode) &&
            (
              <div className="md:w-auto w-full">
                <Button
                  className={`${commonButtonClass} pea-button-outline`}
                  variant="outline"
                  onClick={handleCancelWorkOrder}
                >
                  ยกเลิกใบสั่งงาน
                </Button>
              </div>
            )
          }

          {
            !["B","J","T","X","Y","Z"].includes(workOrderStatusCode) && !disabled ?
            <div className="md:w-auto w-full">
              <Button
                className={`${commonButtonClass} pea-button-outline`}
                variant="outline"
                onClick={onSave}
              >
                บันทึก
              </Button>
            </div> :
              <div className="w-full md:w-auto">
                <Button className="rounded-full text-[#671FAB] bg-white border-1 hover:bg-white border-[#671FAB] cursor-pointer w-full md:w-auto">
                  <FontAwesomeIcon icon={faPrint} className="mr-2" />
                  พิมพ์เอกสาร
                </Button>
              </div>
          }


          {
            currentStep < totalSteps - 1
              && (
                <div className="md:w-auto w-full">
                  <Button
                    className={`${commonButtonClass} pea-button`}
                    onClick={onNext}
                  >
                    ถัดไป
                  </Button>
                </div>
              )
          }

          {
            currentStep === totalSteps - 1 && !disabled
              ? workOrderStatusCode === 'W' //รอเปิดใบสั่งงาน
                ?
                  (
                   <div className="md:w-auto w-full">
                     <Button
                       className={`${commonButtonClass} pea-button`}
                       onClick={handleConfirmCreate}
                     >
                       ยืนยันสร้างใบสั่งงาน
                     </Button>
                   </div>
                  )
                : workOrderStatusCode === "K" //กำลังปฏิบัติงาน
                  ? (
                    <div className="md:w-auto w-full">
                      <Button
                        className={`${commonButtonClass} pea-button`}
                        onClick={handleFinishWorkOrder}
                      >
                        จบงาน
                      </Button>
                    </div>
                  ) : ''
              : ''
          }
        </div>
      </div>
    );
  }

  return (
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
      
      {renderButtons()}

      {/* Popups */}
      <ConfirmCreateWorkOrderPopup
        open={showConfirmCreatePopup}
        onClose={closeAllPopups}
        onConfirm={handleConfirmCreateConfirm}
      />

      <EndWorkPopup open={showEndWorkPopup}
                    onClose={closeAllPopups}
                    onConfirm={handleConfirmFinishWorkOrder}/>

      <ModalCancelWorkOrder open={showCancelWorkOrder}
                            onClose={() => {
                              setShowCancelWorkOrder(false)
                            }}
                            id={id}
      />
    </div>
  );
};

export default WorkOrderActionButtons;
