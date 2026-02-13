import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CardCollapse from "../CardCollapse";
import SignatureSection from "./signature_section";
import { WorkOrderObj } from "@/types";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface RecordKeeperOptions {
  isReadOnly?: boolean;
  initialCustomerSignature?: string;
  initialRecordKeeperSignature?: string;
}

interface RecordKeeperProps {
  data: WorkOrderObj;
  setData: (d: WorkOrderObj) => void;
  options?: RecordKeeperOptions;
}

const RecordKeeper: React.FC<RecordKeeperProps> = ({
  data,
  setData,
  options = {},
}) => {
  const { isReadOnly = false, initialRecordKeeperSignature } = options;
  const recorderName = data?.recorderName || "";
  const recorderPosition = data?.recorderPosition || "";
  const phoneNumber = data?.recorderPhoneNumber || "";
  const [signature, setSignature] = useState<string>(
    data?.recorderSignatureBase64 || initialRecordKeeperSignature || ""
  );

  const updateData = (key: keyof WorkOrderObj, value: string | number) => {
    setData({
      ...data,
      [key]: value,
    });
  };

  const handleSignatureChange = (newSignature: string) => {
    if (!isReadOnly) {
      setSignature(newSignature);
      updateData("recorderSignatureBase64", newSignature);
    }
  };

  return (
    <CardCollapse title="ผู้บันทึกปฏิบัติงาน">
      <div className="p-4 -mt-5">
        <div className="flex flex-row gap-6">
          <div className="flex flex-col flex-1 space-y-4 w-full md:w-[48%]">
            <div>
              <Label
                htmlFor="recorder-name"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                ชื่อผู้บันทึกผลปฏิบัติงาน :
              </Label>
              <div className="flex items-center space-x-2">
                <CustomTooltip 
                  fieldValue={recorderName}
                  fieldLabel="ชื่อผู้บันทึกผลปฏิบัติงาน"
                >
                  <Input
                    id="recorder-name"
                    value={recorderName}
                    placeholder="ชื่อผู้บันทึกผลปฏิบัติงาน :"
                    className="flex-1 h-[44px] border-[#D1D5DB]"
                    readOnly={true}
                  />
                </CustomTooltip>
              </div>
            </div>

            {/* Employee Position */}
            <div>
              <Label
                htmlFor="employee-name"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                ตำแหน่งผู้บันทึกผลปฏิบัติงาน :
              </Label>
              <CustomTooltip 
                fieldValue={recorderPosition}
                fieldLabel="ตำแหน่งผู้บันทึกผลปฏิบัติงาน"
              >
                <Input
                  id="recorder-position"
                  value={recorderPosition}
                  placeholder="ตำแหน่งผู้บันทึกผลปฏิบัติงาน"
                  className="h-[44px] border-[#D1D5DB]"
                  readOnly={true}
                />
              </CustomTooltip>
            </div>

            {/* Phone Number */}
            <div>
              <Label
                htmlFor="phone-number"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                เบอร์โทรผู้บันทึกผลปฏิบัติงาน :
              </Label>
              <CustomTooltip 
                fieldValue={phoneNumber}
                fieldLabel="เบอร์โทรผู้บันทึกผลปฏิบัติงาน"
              >
                <Input
                  id="phone-number"
                  value={phoneNumber}
                  placeholder="หมายเลขโทรศัพท์"
                  className="h-[44px] border-[#D1D5DB]"
                  readOnly={true}
                />
              </CustomTooltip>
            </div>
          </div>

          <div className="w-full md:w-[48%] h-[300px]">
            {/* Right side - Signature Section */}
            <SignatureSection
              title="ภาพลายเซ็นผู้บันทึกผลปฏิบัติงาน"
              signature={signature}
              onSignatureChange={handleSignatureChange}
              showPresetSignature={false}
              showResetButton={true}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>
      </div>
    </CardCollapse>
  );
};

export default RecordKeeper;
