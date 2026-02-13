import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Options} from "@/types";
import {cn} from "@/lib/utils";

interface InputRadioProps {
  label?: string,
  options: Options[],
  value: string,
  setData: (value: string) => void;
  className?: string;
  classItem?: string
  classLabel?: string
  classItemChecked?: string
}

const InputRadio = ({
                      label,
                      options,
                      value,
                      setData,
                      classItem,
                      classItemChecked,
                      classLabel,
                      className
                    }:
                    InputRadioProps) => {
  return (
    <div>
      {
        label && (
          <div className="mb-3">
            {label}
          </div>
        )
      }
      <RadioGroup defaultValue="option-one"
                  className={className && className}
                  value={value}
                  onValueChange={setData}
      >
        {
          options.map((option, index) => (
            <div className={cn(classItem && classItem,
              value === option.value && classItemChecked,
              "flex items-start space-x-2")}
                 key={index}>
              <RadioGroupItem value={option.value as string}
                              id={option.value as string}
                              className="cursor-pointer data-[state=checked]:border-[#9538EA] border-[#9538EA]"
              />
              <Label className={cn('cursor-pointer', classLabel && classLabel)} htmlFor={option.value as string}>
                <div className="mb-1">{option.label}</div>
                {option.description &&
                  <div className="text-[#B05FF3] text-[12px] font-semibold">{option.description}</div>}
              </Label>
            </div>
          ))
        }
      </RadioGroup>
    </div>
  )
}

export default InputRadio;
