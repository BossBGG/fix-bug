import React, {useState} from "react";
import WorkExecution from "@/app/(pages)/work_order/(special-form)/component/work_execution/work_execution";
import AddImages from "@/app/(pages)/work_order/(special-form)/component/work_execution/add_images";
import AddFile from "@/app/(pages)/work_order/(special-form)/component/work_execution/add_file";
import Comment from "@/app/(pages)/work_order/(special-form)/component/work_execution/comment";
import SatisfactionAssessment
  from "@/app/(pages)/work_order/(special-form)/component/work_execution/satisfaction_assessment";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import RatingAndComment from "@/app/(pages)/work_order/(special-form)/component/work_execution/RatingAndComment";
import SignatureSection from "@/app/(pages)/work_order/(special-form)/component/work_execution/signature_section";
import RecordKeeper from "@/app/(pages)/work_order/(special-form)/component/work_execution/record_keeper";
import {useAppSelector} from "@/app/redux/hook";
import {WorkOrderObj} from "@/types";
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

interface ExecuteWorkOrderProps {
  requestCode: string,
  isSurvey: boolean,
  renderByService: () => React.ReactNode,
  disabled?: boolean,
  data: WorkOrderObj,
  setData: (data: WorkOrderObj) => void
}

export const ExecuteWorkOrder: React.FC<ExecuteWorkOrderProps> = ({
                                                                    requestCode,
                                                                    isSurvey,
                                                                    renderByService,
                                                                    disabled = false,
                                                                    data,
                                                                    setData
                                                                  }) => {
  const screenSize = useAppSelector(state => state.screen_size)
  const [rating, setRating] = useState<number>(data?.execution?.serviceSatisfaction || 0);
  const [comment, setComment] = useState<string>(data?.execution?.satisfactionComment || "");
  const userSignature = useAppSelector(state => state.user?.signatureImageUrl) || "";
  const customerPresetSignature = data?.execution?.customerSignature || "";
  const recordKeeperPresetSignature = data?.execution?.recorderSignature || userSignature;
  const [recordKeeperSignature, setRecordKeeperSignature] = useState<string>(data?.recorderSignatureBase64 || data?.execution?.recorderSignature || userSignature || "");
  const [customerSignature, setCustomerSignature] = useState<string>(data?.customerSignatureBase64 || data?.execution?.customerSignature || "");
  const [customerSignType, setCustomerSignType] = useState<string>(data?.customerSignatureBase64 ? "new" : "preset");
  const [recordKeeperSignType, setRecordKeeperSignType] = useState<string>(data?.recorderSignatureBase64 ? "new" : "preset");

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    onUpdateData('serviceSatisfaction', newRating)
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    const words = newComment.trim().split(/\s+/);
    if (words.length <= 50) {
      setComment(newComment);
      onUpdateData('satisfactionComment', newComment)
    }
  };

  const handleCustomerSignatureChange = (newSignature: string) => {
    setCustomerSignature(newSignature);
    onUpdateData('customerSignatureBase64', newSignature)
  };

  const handleRecordKeeperSignatureChange = (newSignature: string) => {
    setRecordKeeperSignature(newSignature);
    onUpdateData('recorderSignatureBase64', newSignature)
  };

  const onUpdateData = (key: keyof WorkOrderObj, value: string | number) => {
    setData({...data, [key]: value})
  }

  return (
    <div>
      {/*ผลการปฏิบัติงาน*/}
      <WorkExecution
        options={{
          isReadOnly: disabled
        }}
        data={data}
        setData={setData}
      />

      {/*{isSurvey && renderByService()}*/}
      {renderByService()}

      {/*รูปแนบเพิ่มเติม*/}
      <AddImages
        options={{
          isReadOnly: disabled
        }}
        data={data}
        setData={setData}
      />

      {/*ไฟล์แนบเพิ่มเติม*/}
      <AddFile
        options={{
          isReadOnly: disabled
        }}
        data={data}
        setData={setData}
      />

      {/*หมายเหตุเพิ่มเติม*/}
      <Comment
        options={{
          isReadOnly: disabled
        }}
        data={data}
        setData={setData}
      />

      {screenSize === MOBILE_SCREEN ? (
        <>
          {/* Mobile version - separate components with CardCollapse */}
          <CardCollapse title="ผลการประเมินความพึงพอใจของลูกค้าต่อการปฏิบัติงาน">
            <div className="p-4 -mt-6">
              <RatingAndComment
                rating={rating}
                comment={comment}
                onRatingChange={handleRatingChange}
                onCommentChange={handleCommentChange}
                isReadOnly={disabled}
              />

              {/* Show word count for mobile (max 50 words) */}
              <div className="flex justify-end mt-2">
                      <span
                        className={`text-sm ${
                          comment.trim().split(/\s+/).length > 45
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {
                          comment
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0).length
                        }
                        /50 คำ
                      </span>
              </div>
            </div>
          </CardCollapse>

          <CardCollapse key="customer-signature" title="ลายเซ็นลูกค้า">
            <div className="p-4 -mt-6">
              <SignatureSection
                title="ภาพลายเซ็นลูกค้า"
                signature={customerSignature}
                onSignatureChange={handleCustomerSignatureChange}
                isReadOnly={disabled}
                signatureType={customerSignType}
                onSignatureTypeChange={setCustomerSignType}
                presetSignatureUrl={customerPresetSignature}
                showPresetSignature={true}
                uniqueId="customer"
              />
            </div>
          </CardCollapse>

          <CardCollapse key="recordkeeper-signature" title="ลายเซ็นผู้บันทึกปฏิบัติงาน">
            <div className="p-4 -mt-6">
              <SignatureSection
                title="ภาพลายเซ็นผู้บันทึกปฏิบัติงาน"
                signature={recordKeeperSignature}
                onSignatureChange={handleRecordKeeperSignatureChange}
                isReadOnly={disabled}
                signatureType={recordKeeperSignType}
                onSignatureTypeChange={setRecordKeeperSignType}
                presetSignatureUrl={recordKeeperPresetSignature}
                showPresetSignature={true}
                uniqueId="recordkeeper"
              />
            </div>
          </CardCollapse>
        </>
      ) : (
        <>
          {/*ความพึงพอใจต่อการให้บริการ*/}
          <SatisfactionAssessment
            options={{
              isReadOnly: disabled
            }}
            onRatingChange={handleRatingChange}
            onCommentChange={handleCommentChange}
            onSignatureChange={handleCustomerSignatureChange}
            data={data}
          />
          {/*ผู้บันทึกผลปฏิบัติงาน*/}
          <RecordKeeper
            options={{
              isReadOnly: disabled,
              initialRecordKeeperSignature: recordKeeperPresetSignature
            }}
            data={data}
            setData={setData}
          />
        </>
      )}
    </div>
  )
}
