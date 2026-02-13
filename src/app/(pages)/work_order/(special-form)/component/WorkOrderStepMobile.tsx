import {CircularProgress} from "@/app/(pages)/work_order/(special-form)/component/CircularProgress";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {Card} from "@/components/ui/card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";

interface WorkOrderStepMobileProps {
  steps: {
    name: string,
    icon: IconProp
  }[],
  currentStep: number,
  updateStep: (step: number) => void,
}


const WorkOrderStepMobile = ({
                               steps,
                               currentStep,
                               updateStep
                             }: WorkOrderStepMobileProps) => {
  return (
    <Card className="rounded-[20px] mb-4 bg-[#FDFDFD] font-semibold p-4"
          style={{boxShadow: '0px 4px 4px 0px #A6AFC366'}}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {
            currentStep > 0 &&
            <div onClick={() => updateStep(currentStep - 1)} className="mr-2">
              <FontAwesomeIcon icon={faChevronLeft} size={"lg"} className="cursor-pointer"/>
            </div>
          }

          <CircularProgress value={currentStep + 1} total={steps.length}/>
          <div className="ml-2">
            {steps.filter((step, i) => i === currentStep)[0]?.name}
          </div>
        </div>

        {
          currentStep < steps.length - 1 &&
          <div onClick={() => updateStep(currentStep + 1)}>
            <FontAwesomeIcon icon={faChevronRight} size={"lg"} className="cursor-pointer"/>
          </div>
        }
      </div>
    </Card>
  )
}

export default WorkOrderStepMobile;
