import {DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import ButtonSearch from "@/app/components/list/ButtonSearch";

interface ModalProps {
  title: string,
  children: React.ReactNode,
  clearFilter: () => void,
  submitSearch: () => void,
}

const ModalFilter = ({
                 title,
                 children,
                 clearFilter,
                 submitSearch,
               }: ModalProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          <div className="text-[#160C26]">{title}</div>
        </DialogTitle>
      </DialogHeader>

      {children}

      <DialogFooter className="w-full">
        <DialogClose asChild>
          <div className="w-full flex flex-wrap justify-between items-center">
            <div className="w-full text-[#671FAB] font-semibold md:w-1/2 md:text-start text-center cursor-pointer"
                 onClick={() => clearFilter()}>
              เคลียร์ค่าทั้งหมด
            </div>

            <div className="w-full md:w-[25%]">
              <ButtonSearch visibleIconSearch={false}
                            onClickSearch={() => submitSearch()}
              />
            </div>
          </div>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

export default ModalFilter;
