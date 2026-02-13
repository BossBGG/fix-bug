"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import ModalNewWorkOrder from "@/app/(pages)/work_order/modal-new-work-order";
import { Button } from "@/components/ui/button";
import {useAppSelector} from "@/app/redux/hook";

interface ViewButtonProps {
  label: string;
  selected: boolean;
  updateData: () => void;
}

interface AddonRightContentProps {
  viewMode: "ALL" | "SELF";
  updateViewMode: (mode: "ALL" | "SELF") => void;
  countWorkOrder: number;
}

const ViewButton = ({ label, selected, updateData }: ViewButtonProps) => {
  const defaultClass =
    "w-1/2 rounded-full shadow-none cursor-pointer bg-[#F8F8F8] text-[#57595B] hover:bg-transparent";
  const activeClass = "bg-[#E1D2FF] text-[#671FAB]";

  return (
    <Button
      className={`${defaultClass} ${selected && activeClass}`}
      onClick={() => updateData()}
    >
      {label}
    </Button>
  );
};

const AddonRightContent = ({
  viewMode,
  updateViewMode,
  countWorkOrder,
}: AddonRightContentProps): React.ReactNode => {
  const [isOpenNewWorkOrder, setIsOpenNewWorkOrder] = useState(false);
  const [workOrderType, setWorkOrderType] = useState<
    "ref_service_req" | "not_reference" | "ref_work_order"
  >("not_reference");
  const defaultClassMenuItem = "p-3 cursor-pointer mb-3";
  const user = useAppSelector((state) => state.user);

  const onSelect = (
    type: "ref_service_req" | "not_reference" | "ref_work_order"
  ) => {
    setIsOpenNewWorkOrder(true);
    setWorkOrderType(type);
  };

  return (
    <div className="flex items-center justify-end flex-wrap lg:flex-nowrap">
      {
        user.type !== 'VENDOR_USER' &&
        (
          <div className="bg-[#F8F8F8] text-[#4A4A4A] rounded-full p-1 font-semibold w-full mr-2 my-3 sm:my-0">
            <ViewButton
              label="มุมมองทั้งหมด"
              /*label={`มุมมองทั้งหมด ${
                countWorkOrder > 0 && viewMode === "ALL"
                  ? `(${countWorkOrder})`
                  : ""
              }`}*/
              selected={viewMode === "ALL"}
              updateData={() => {
                updateViewMode("ALL");
              }}
            />
            <ViewButton
              label={"มุมมองตนเอง"}
              /*label={`มุมมองตนเอง  ${
                countWorkOrder > 0 && viewMode === "SELF"
                  ? `(${countWorkOrder})`
                  : ""
              }`}*/
              selected={viewMode === "SELF"}
              updateData={() => {
                updateViewMode("SELF");
              }}
            />
          </div>
        )
      }

      {
        user.type !== 'VENDOR_USER' &&
        (
          <DropdownMenu>
            <DropdownMenuTrigger className="pea-button h-[44px] text-nowrap">
              <FontAwesomeIcon icon={faPlus} className="mr-1"/>
              สร้างใบสั่งงาน
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="p-3">
              <DropdownMenuItem
                className={defaultClassMenuItem}
                onClick={() => onSelect("ref_service_req")}
              >
                สร้างใบสั่งงาน อ้างอิงใบคำร้อง
              </DropdownMenuItem>
              <DropdownMenuItem
                className={defaultClassMenuItem}
                onClick={() => onSelect("ref_work_order")}
              >
                สร้างใบสั่งงานย่อย อ้างอิงใบสั่งงานหลัก
              </DropdownMenuItem>
              <DropdownMenuItem
                className={defaultClassMenuItem}
                onClick={() => onSelect("not_reference")}
              >
                สร้างใบสั่งงานใหม่
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      <ModalNewWorkOrder
        open={isOpenNewWorkOrder}
        onClose={() => setIsOpenNewWorkOrder(false)}
        workOrderType={workOrderType}
      />
    </div>
  );
};
export default AddonRightContent;
