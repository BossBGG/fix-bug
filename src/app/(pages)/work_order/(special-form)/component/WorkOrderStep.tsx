import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {cn} from "@/lib/utils";
import {Card, CardContent} from "@/components/ui/card";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {Label} from "@/components/ui/label";

interface WorkOrderStepProps {
  steps: {
    name: string,
    icon: IconProp
  }[],
  currentStep: number,
  updateStep: (step: number) => void,
}

const WorkOrderStep = ({
                         steps,
                         currentStep,
                         updateStep
                       }: WorkOrderStepProps) => {

  return (
    <Card className="rounded-[20px] mb-4 bg-[#F2F2F2]"
          style={{boxShadow: '0px 4px 4px 0px #A6AFC366'}}>
      <CardContent className="py-4 px-2 flex justify-center">
        <div className="flex justify-center w-[80%]">
          {
            steps.map((item, i) => (
              <div className={`flex items-center cursor-pointer ${i === steps.length - 1 ? 'w-fit' : 'w-[60%]'}`}
                   key={i}
                   onClick={() => updateStep(i)}
                   id={`work_order_step_${i}`}
              >
                <Label htmlFor={`work_order_step_${i}`} className="flex items-center mx-3 cursor-pointer">
                  <div
                    className={cn('rounded-full w-[48px] h-[48px] flex mr-2 items-center justify-center', currentStep === i ? 'bg-[#671FAB] text-white' : 'bg-white')}>
                    <FontAwesomeIcon icon={item.icon} size="xl"/>
                  </div>
                  <div className="text-nowrap">{item.name}</div>
                </Label>

                {
                  i < steps.length - 1 && (
                    <div className="h-[6px] bg-[#D4D6DD] w-full"></div>
                  )
                }
              </div>
            ))
          }
        </div>
      </CardContent>
    </Card>
  )
}

export default WorkOrderStep;
