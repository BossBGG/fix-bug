import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import React from "react";

interface ModalProps {
  title: string,
  children: React.ReactNode,
  footer?: React.ReactNode,
  open: boolean,
  onClose: () => void,
  classContent?: string,
  disableFooterClose?: boolean
}

const ModalFilter = ({
                       title,
                       children,
                       footer,
                       open,
                       onClose,
                       classContent,
                       disableFooterClose = false
                     }: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-h-[85%] overflow-x-hidden ${classContent || ''}`}>
        <DialogHeader>
          <DialogTitle>
            <div className="text-[#160C26] text-left text-[20px]">{title}</div>
          </DialogTitle>
        </DialogHeader>

        {children}

        {
          footer &&
          <DialogFooter className="w-full">
            {disableFooterClose ? (
              footer
            ) : (
              <DialogClose asChild>
                {footer}
              </DialogClose>
            )}
          </DialogFooter>
        }
      </DialogContent>
    </Dialog>
  )
}

export default ModalFilter;
