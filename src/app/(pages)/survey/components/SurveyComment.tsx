import React from "react";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import InputTextArea from "@/app/components/form/InputTextArea";
import { Survey } from "@/types";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

type SurveyCommentProps = {
  data: Survey;
  updateData: (e: any) => void;
};

const SurveyComment: React.FC<SurveyCommentProps> = ({ data, updateData }) => {
  const [note, setNote] = React.useState<string>(
    data.surveyData?.result_note || ""
  );

  const handleChange = (val: string) => {
    setNote(val);
    updateData({
      ...data,
      surveyData: {
        ...data.surveyData,
        result_note: val,
      },
    });
  };
  return (
    <CardCollapse title={"หมายเหตุเพิ่มเติม"}>
      <CustomTooltip 
        fieldValue={note}
        fieldLabel="หมายเหตุเพิ่มเติม"
        variant="textarea"
      >
        <InputTextArea
          data={note}
          label={"หมายเหตุเพิ่มเติม"}
          onChange={handleChange}
        />
      </CustomTooltip>
    </CardCollapse>
  );
};

export default SurveyComment;
