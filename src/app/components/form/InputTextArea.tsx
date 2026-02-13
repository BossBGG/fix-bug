import React, {useState} from "react";

type InputTextAreaProps = {
  label?: string;
  data: any;
  onChange: (val: string) => void;
  isReadOnly?: boolean,
  maxLength?: number
}

const InputTextArea: React.FC<InputTextAreaProps> = ({
                                                       label,
                                                       data,
                                                       onChange,
                                                       isReadOnly,
                                                       maxLength=250
                                                     }) => {
  const [currentLength, setCurrentLength] = useState(data?.length || 0);
  const [value, setValue] = useState(data);
  const handleChange = (val: string) => {
    if (val.length <= maxLength) {
      setValue(val);
      setCurrentLength(val.length);
      onChange(val);
    }
  }

  return (
    <div>
      {
        label && (
          <label htmlFor="input-textarea" className="font-medium">
            {label}
          </label>
        )
      }
      <textarea
        id="input-textarea"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e.target.value)}
        className="w-full rounded-md border border-input p-3 mt-3"
        rows={4}
        readOnly={isReadOnly}
      />

      {!isReadOnly && (
        <div className="flex justify-end">
          <span className={`text-sm ${currentLength > maxLength - 20 ? 'text-red-500' : 'text-gray-500'}`}>
            {currentLength}/{maxLength}
          </span>
        </div>
      )}
    </div>
  )
}

export default InputTextArea
