import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import InputSearchSelect from "@/app/components/form/InputSearchSelect";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import { MapPin } from "lucide-react";

// Mock Data Station
export const MOCK_STATIONS = [
  {
    id: "1",
    pea_name: "การไฟฟ้าส่วนภูมิภาคอำเภอแม่ริม",
    available: 2,
    distance: 15.5,
    size: "60kW",
  },
  {
    id: "2",
    pea_name: "การไฟฟ้าส่วนภูมิภาคจังหวัดเชียงใหม่",
    available: 8,
    distance: 22.0,
    size: "60kW",
  },
  {
    id: "3",
    pea_name: "การไฟฟ้าส่วนภูมิภาคอำเภอสันทราย",
    available: 5,
    distance: 18.2,
    size: "120kW",
  },
  {
    id: "4",
    pea_name: "การไฟฟ้าส่วนภูมิภาคอำเภอหางดง",
    available: 1,
    distance: 30.5,
    size: "300kW",
  },
  {
    id: "5",
    pea_name: "การไฟฟ้าส่วนภูมิภาคอำเภอสันกำแพง",
    available: 3,
    distance: 25.0,
    size: "500kW",
  },
];

interface StationDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "select";
  onSelect?: (station: any) => void;
  initialSelection?: string | null;
  isAddMode?: boolean;
  rentalStartDate?: Date | string;
  rentalEndDate?: Date | string;
}

const KW_OPTIONS = ["60kW", "120kW", "300kW", "500kW", "800kW", "1,000kW"];

export default function StationDialog({
  open,
  onClose,
  mode,
  onSelect,
  initialSelection,
  isAddMode = false,
  rentalStartDate,
  rentalEndDate,
}: StationDialogProps) {
  const [activeKw, setActiveKw] = useState("60kW");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    initialSelection || null
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open && initialSelection) {
      const station = MOCK_STATIONS.find((s) => s.id === initialSelection);
      if (station) {
        setActiveKw(station.size);
        setSelectedStationId(initialSelection);
      }
    } else if (open) {
      setSelectedStationId(null);
    }

    if (!open) {
      setSearchTerm("");
    }
  }, [initialSelection, open]);

  const filteredStations = MOCK_STATIONS.filter(
    (s) => s.size === activeKw && s.pea_name.includes(searchTerm)
  );

  const handleConfirm = () => {
    if (onSelect && selectedStationId) {
      const station = MOCK_STATIONS.find((s) => s.id === selectedStationId);

      onSelect({ station, size: activeKw });
    }
    onClose();
  };

  const periodTimeTitle = useMemo(() => {
    if (rentalStartDate && rentalEndDate) {
      const start = new Date(rentalStartDate);
      const end = new Date(rentalEndDate);

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const THDateFormat = new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      });

      const startDate = THDateFormat.format(start);
      const endDate = THDateFormat.format(end);

      return `${startDate} - ${endDate} (${diffDays} วัน)`;
    }

    return "";
  }, [rentalStartDate, rentalEndDate]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] md:w-[85vw] lg:w-[75vw] max-w-[1000px] h-[90vh] md:h-[85vh] lg:h-[80vh] flex flex-col p-0 gap-0"
        style={{ maxWidth: "1000px" }}
      >
        <DialogHeader className="bg-purple-600 text-white p-4 md:p-6 rounded-t-lg shrink-0">
          <DialogTitle className="text-white gap-2 ">
            <div className="flex flex-row gap-1 font-semibold mb-2">
              <MapPin />
              <div className="mt-1">เลือกเครื่องกำเนิดไฟฟ้า</div>
            </div>
            <div className="text-sm">
              วันที่เริ่มต้น - สิ้นสุดการเช่า {periodTimeTitle}
            </div>
          </DialogTitle>
          {/* kW Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/30 pb-2 pt-2">
            {KW_OPTIONS.map((kw) => (
              <Button
                key={kw}
                variant={activeKw === kw ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveKw(kw);
                
                }}
                className={`rounded-full ${
                  activeKw === kw
                    ? "bg-white text-purple-600"
                    : "bg-transparent text-white border-white"
                }`}
              >
                <FontAwesomeIcon icon={faTruck} />
                {kw}
              </Button>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 md:p-6 shrink-0">
            {/* Search Bar */}
            <div className="w-full">
              <InputSearchSelect
                placeholder="ค้นหาการไฟฟ้า..."
                selectOptions={MOCK_STATIONS.map((s) => ({
                  label: s.pea_name,
                  value: s.pea_name,
                }))}
                onChange={(e: any) => setSearchTerm(e?.value || "")}
                value={searchTerm}
                fetchOptions={() => {}}
                loading={false}
              />
            </div>
            <div className="mt-4">เฉพาะในพื้นที่ใกล้เคียง</div>
          </div>

          {/* Station List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6">
            {mode === "select" ? (
              <RadioGroup
                value={selectedStationId || ""}
                onValueChange={setSelectedStationId}
                className="space-y-2"
              >
                {filteredStations.map((station) => (
                  <div
                    key={station.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={station.id}
                        id={`st-${station.id}`}
                      />
                      <Label
                        htmlFor={`st-${station.id}`}
                        className="cursor-pointer gap-8 "
                      >
                        <div className="font-medium text-base">
                          {station.pea_name}
                        </div>
                        <div className={`flex flex-row text-sm gap-2`}>
                          <div>เครื่อง</div> <div>{station.available}</div>
                        </div>
                        <div className="text-sm ">{station.distance} กม.</div>
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              // View Mode (List only)
              <div className="space-y-2">
                {filteredStations.map((station) => (
                  <div
                    key={station.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-base">
                        {station.pea_name}
                      </div>
                      <div className={`flex flex-row text-sm gap-2`}>
                        <div>เครื่อง</div> <div>{station.available}</div>
                      </div>
                      <div className="text-sm ">{station.distance} กม.</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredStations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                ไม่พบข้อมูลในขนาด {activeKw}
              </div>
            )}
          </div>

          <div className="px-4 md:px-6 text-right text-xs text-gray-500 shrink-0">
            **ระยะทางระหว่างการไฟฟ้าเจ้าของเครื่องถึงสถานที่ให้บริการ
          </div>
        </div>

        <DialogFooter className="p-4 md:p-6 pt-0 shrink-0 flex-row gap-2 justify-end">
          {mode === "select" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-purple-600 text-white hover:bg-purple-700"
                disabled={!selectedStationId}
              >
                ยืนยัน
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              ปิด
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
