import React, { useState } from "react";
import CardCollapse from "../CardCollapse";


import SignatureSection from "./signature_section";
import RatingAndComment from "./RatingAndComment";
import {WorkOrderObj} from "@/types";

interface SatisfactionAssessmentOptions {
  isReadOnly?: boolean;
  initialRating?: number;
  initialComment?: string;
}

interface SatisfactionAssessmentProps {
  onRatingChange: (rating: number) => void;
  onCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSignatureChange: (signature: string) => void;
  options?: SatisfactionAssessmentOptions;
  data: WorkOrderObj
}

const SatisfactionAssessment: React.FC<SatisfactionAssessmentProps> = ({
                                                                         onRatingChange,
                                                                         onCommentChange,
                                                                         onSignatureChange,
                                                                         options = {},
                                                                         data
}) => {
  const { isReadOnly = false, initialRating = 0 , initialComment = "" } = options;
  const [rating, setRating] = useState<number>(data?.execution?.serviceSatisfaction || 0);
  const [comment, setComment] = useState<string>(data?.execution?.satisfactionComment || "");
  const [signature, setSignature] = useState<string>(data?.customerSignatureBase64 || data?.execution?.customerSignature || "");

  const handleRatingChange = (newRating: number) => {
    if (!isReadOnly) {
      setRating(newRating);
      onRatingChange(newRating)
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isReadOnly) {
      const newComment = e.target.value;
      setComment(newComment);
      onCommentChange(e)
    }
  };

  const handleSignatureChange = (newSignature: string) => {
    if (!isReadOnly) {
      setSignature(newSignature);
      onSignatureChange(newSignature)
    }
  };

  return (
    <CardCollapse title="ผลการประเมินความพึงพอใจของลูกค้าต่อการปฏิบัติงาน">
      <div className="p-4 space-y-6 -mt-6">
        {/* Main Layout with flex-row */}
        <div className="flex flex-row gap-4 justify-between">
          {/* Left side - Rating and Comment */}
          <div className="w-full md:w-[48%]">
            <RatingAndComment
              rating={rating}
              comment={comment}
              onRatingChange={handleRatingChange}
              onCommentChange={handleCommentChange}
              isReadOnly={isReadOnly}
            />
          </div>

          <div className="w-full md:w-[48%] h-[300px]">
            {/* Right side - Signature Section */}
            <SignatureSection
              title="ภาพลายเซ็นลูกค้า"
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

export default SatisfactionAssessment;
