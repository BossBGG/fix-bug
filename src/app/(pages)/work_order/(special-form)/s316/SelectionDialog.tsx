import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StationDialog from "./StationDialog";
import { Link2 } from "lucide-react";
import InputText from "@/app/components/form/InputText";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface SelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  initialData?: any;
  mode?: "edit";
}

const KW_OPTIONS = ["60kW", "120kW", "300kW", "500kW", "800kW", "1,000kW"];

export default function SelectionDialog({
  open,
  onClose,
  onConfirm,
  initialData,
  mode,
}: SelectionDialogProps) {
  const [formData, setFormData] = useState({
    size: "",
    owner: null as any,
    contactNumber: "",
  });

  const [isStationDialogOpen, setIsStationDialogOpen] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        size: initialData.size || "",
        owner: initialData.owner || null,
        contactNumber: initialData.contactNumber || "",
      });
    } else if (open) {
      setFormData({ size: "", owner: null, contactNumber: "" });
    }
  }, [open, initialData]);

  const handleStationSelect = (data: any) => {
    const station = data.station || data;
    const size = data.size || station.size;
    setFormData((prev) => ({ ...prev, owner: station, size: size }));
  };

  const handleConfirm = () => {
    onConfirm(formData);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-[95vw] ">
          <DialogHeader>
            <DialogTitle className="text-purple-600">
              เลือกรายการเครื่องกำเนิดไฟฟ้า
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ขนาดเครื่องกำเนิดไฟฟ้า</Label>
              <CustomTooltip 
                fieldValue={formData.size}
                fieldLabel="ขนาดเครื่องกำเนิดไฟฟ้า"
                variant="select"
              >
                <Select
                  value={formData.size}
                  onValueChange={(val) =>
                    setFormData({ ...formData, size: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกขนาด" />
                  </SelectTrigger>
                  <SelectContent>
                    {KW_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CustomTooltip>
            </div>

            <div className="space-y-2">
              <Label>การไฟฟ้าเจ้าของเครื่อง</Label>
              <CustomTooltip 
                fieldValue={formData.owner?.pea_name}
                fieldLabel="การไฟฟ้าเจ้าของเครื่อง"
                variant="label"
              >
                <div
                  className="border rounded-md p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                  onClick={() => setIsStationDialogOpen(true)}
                >
                  <span
                    className={
                      formData.owner ? "text-black" : "text-gray-400"
                    }
                  >
                    {formData.owner
                      ? formData.owner.pea_name
                      : "เลือกการไฟฟ้า"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 bg-purple-600 hover:bg-purple-700 text-white hover:text-white"
                  >
                    <Link2 /> เลือก
                  </Button>
                </div>
              </CustomTooltip>
            </div>

            <div className="space-y-2">
              <Label>เบอร์ติดต่อการไฟฟ้าเจ้าของเครื่อง</Label>
              <CustomTooltip 
                fieldValue={formData.contactNumber}
                fieldLabel="เบอร์ติดต่อการไฟฟ้าเจ้าของเครื่อง"
                variant="label"
              >
                <InputText
                  placeholder="ระบุเบอร์โทรศัพท์"
                  value={formData.contactNumber}
                  numberOnly={true}
                  onChange={(value) =>
                    setFormData({ ...formData, contactNumber: value })
                  }
                  format="phone"
                />
              </CustomTooltip>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-purple-600 text-white hover:bg-purple-700"
              disabled={!formData.size || !formData.owner}
            >
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nested Dialog: Station Selector */}
      <StationDialog
        open={isStationDialogOpen}
        onClose={() => setIsStationDialogOpen(false)}
        mode="select"
        onSelect={handleStationSelect}
        initialSelection={formData.owner?.id}
        isAddMode={false}
      />
    </>
  );
}
