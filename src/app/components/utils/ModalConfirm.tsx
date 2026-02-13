import Modal from "@/app/layout/Modal";
import {Button} from "@/components/ui/button";
import React from "react";

interface ModalConfirmProps {
  open: boolean
  onCancel: () => void,
  onSubmit: () => void,
  confirmText?: string,
  icon?: React.ReactNode;
  title?: string,
  message?: string,
}

export const ModalConfirm = ({
                               open,
                               onCancel,
                               onSubmit,
                               confirmText = "ยืนยัน",
                               icon,
                               title = "",
                               message = ""
                             }: ModalConfirmProps) => {
  return (
    <Modal title={""}
           open={open}
           onClose={() => onCancel()}
           classContent="w-[80%] md:w-[50%] lg:w-[45%] xl:w-[25%]"
           footer={<div className="w-full flex justify-center">
             <Button onClick={() => onSubmit()}
                     className="w-full rounded-full bg-[#671FAB] hover:bg-[#671FAB] cursor-pointer border-[#671FAB] text-white"
             >
               {confirmText}
             </Button>
           </div>}
    >
      <div className="flex flex-col items-center">
        <div className="mb-5">
          {icon}
        </div>

        <div className="font-bold text-[24px] mb-2">{title}</div>
        <div className="text-[#4A4A4A] font-semibold">{message}</div>
      </div>
    </Modal>
  )
}
