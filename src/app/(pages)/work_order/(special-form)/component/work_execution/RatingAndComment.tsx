import React from "react";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "@/app/redux/hook";
import { MOBILE_SCREEN } from "@/app/redux/slices/ScreenSizeSlice";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface RatingAndCommentProps {
  rating: number;
  comment: string;
  onRatingChange: (rating: number) => void;
  onCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxWords?: number;
  isReadOnly?: boolean;
}

const RatingAndComment: React.FC<RatingAndCommentProps> = ({
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  maxWords = 250,
  isReadOnly = false,
}) => {
  const screenSize = useAppSelector((state) => state.screen_size);


  const wordLimit = screenSize === MOBILE_SCREEN ? 50 : maxWords;

  const handleRatingClick = (star: number) => {
    if (!isReadOnly) {
      onRatingChange(star);
    }
  };

  // ฟังก์ชันนับคำที่รองรับภาษาไทยและอังกฤษ
  const countWords = (text: string): number => {
    if (text.trim() === "") return 0;
    
    
    const thaiChars = text.replace(/[^ก-๙]/g, "").length;
    
    const engChars = text.replace(/[^a-zA-Z0-9]/g, "").length;
    
    const totalCount = thaiChars + engChars;
    
    return totalCount;
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isReadOnly) return;

    const newComment = e.target.value;
    const wordCount = countWords(newComment);
    

    // จำกัดจำนวนคำ
    if (wordCount <= wordLimit) {
      onCommentChange(e);
    } else {
      // ถ้าเกินจำนวนคำที่กำหนด ให้ตัดข้อความ
      let limitedComment = "";
      let currentCount = 0;
      
      for (let i = 0; i < newComment.length; i++) {
        const char = newComment[i];
        const isThai = /[ก-๙]/.test(char);
        const isEngOrNum = /[a-zA-Z0-9]/.test(char);
        
        if (isThai || isEngOrNum) {
          currentCount++;
        }
        
        if (currentCount > wordLimit) break;
        limitedComment += char;
      }

      console.log("Limited comment:", limitedComment);

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: limitedComment,
        },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      onCommentChange(syntheticEvent);
    }
  };

  const currentWordCount = countWords(comment);

  return (
    <div className="flex flex-col space-y-6">
      {/* Rating Section */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          คะแนนประเมิน 5/5 :
        </Label>

        <div className="flex items-center space-x-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              className={`transition-colors ${
                screenSize === MOBILE_SCREEN ? "text-xl" : "text-2xl"
              } ${
                star <= rating
                  ? "text-yellow-400 hover:text-yellow-500"
                  : "text-gray-300 hover:text-gray-400"
              }`}
            >
              <FontAwesomeIcon icon={faStar} />
            </button>
          ))}
          <span className="ml-3 text-sm font-medium text-gray-700">
            {rating}/5 {rating > 0 && ``}
          </span>
        </div>
      </div>

      {/* Comment Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label
            htmlFor="satisfaction-comment"
            className="text-sm font-medium text-gray-700"
          >
            ความคิดเห็น :
          </Label>
          {!isReadOnly && (
            <span
              className={`text-sm ${
                currentWordCount > wordLimit
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {currentWordCount}/{wordLimit} คำ
            </span>
          )}
        </div>

        <CustomTooltip 
          fieldValue={comment}
          fieldLabel="ความคิดเห็น"
          variant="textarea"
        >
          <textarea
            id="satisfaction-comment"
            value={comment}
            onChange={handleCommentChange}
            placeholder={
              isReadOnly
                ? ""
                : screenSize === MOBILE_SCREEN
                ? "ระบุข้อคิดเห็น"
                : "ระบุข้อคิดเห็น"
            }
            readOnly={isReadOnly}
            disabled={isReadOnly}
            className={`flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 border-[#D1D5DB] focus:border-[#671FAB] focus:ring-[#671FAB] md:text-sm resize-none ${
              screenSize === MOBILE_SCREEN
                ? "min-h-[80px]"
                : "min-h-[120px]"
            }`}
            rows={screenSize === MOBILE_SCREEN ? 3 : 6}
          />
        </CustomTooltip>

        {/* Warning message when approaching word limit */}
        {!isReadOnly && currentWordCount > wordLimit - 10 && (
          <p className="text-sm text-red-500 mt-1">
            {screenSize === MOBILE_SCREEN
              ? `เหลืออีก ${wordLimit - currentWordCount} คำ`
              : `กำลังใกล้ถึงขีดจำกัด ${wordLimit} คำ`}
          </p>
        )}
      </div>
    </div>
  );
};

export default RatingAndComment;
