import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import CardCollapse from "../CardCollapse";
import { useAppSelector } from "@/app/redux/hook";
import { WorkOrderObj } from "@/types";
import { MOBILE_SCREEN } from "@/app/redux/slices/ScreenSizeSlice";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface CommentOptions {
  isReadOnly?: boolean;
  initialValue?: string;
}

interface CommentProps {
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  options?: CommentOptions;
  data: WorkOrderObj;
  setData: (d: WorkOrderObj) => void;
}

const Comment: React.FC<CommentProps> = ({
  value = "",
  onChange,
  maxLength = 250,
  options = {},
  data,
  setData,
}) => {
  const { isReadOnly = false, initialValue } = options;

  const [comment, setComment] = useState("");
  const screenSize = useAppSelector((state) => state.screen_size);

  useEffect(() => {
    setComment(data?.executionNote || "");
  }, [data.executionNote]);

  // ใช้ 50 ตัวอักษรสำหรับ mobile, 250 ตัวอักษรสำหรับ desktop
  const characterLimit = screenSize === MOBILE_SCREEN ? 50 : maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isReadOnly) return;

    const newValue = e.target.value;

    // Limit character count
    if (newValue.length <= characterLimit) {
      setComment(newValue);
      onChange?.(newValue);
      setData({ ...data, executionNote: newValue });
    }
  };

  const currentLength = comment.length;

  const renderContent = () => {
    return (
      <div className="p-0 md:p-4 border-0 md:border-1 mb-4 rounded-lg shadow-none md:shadow-md border-[#E1D2FF] ">
        <div className="space-y-3 -mt-5 md:mt-0">
          <div>หมายเหตุเพิ่มเติม</div>
          <CustomTooltip 
            fieldValue={comment}
            fieldLabel="หมายเหตุเพิ่มเติม"
            variant="textarea"
          >
            <textarea
              id="comment"
              value={comment}
              onChange={handleChange}
              placeholder="กรอกหมายเหตุเพิ่มเติม"
              maxLength={characterLimit}
              readOnly={isReadOnly}
              disabled={isReadOnly}
              rows={4}
              className="w-full p-3 rounded-md border-1"
            />
          </CustomTooltip>

          {!isReadOnly && (
            <div className="flex justify-end">
              <span
                className={`text-sm ${
                  currentLength > characterLimit - 20
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {currentLength}/{characterLimit}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return screenSize !== MOBILE_SCREEN ? (
    renderContent()
  ) : (
    <CardCollapse title="หมายเหตุเพิ่มเติม">
      <div className="p-4">{renderContent()}</div>
    </CardCollapse>
  );
};

export default Comment;
