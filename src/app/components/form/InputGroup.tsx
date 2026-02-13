import {Input} from "@/components/ui/input";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {forwardRef, useImperativeHandle, useMemo, useState} from "react";
import debounce from "lodash/debounce";

type InputGroupProps = {
  icon: IconProp;
  placeholder: string;
  setData: (value: string) => void;
}

export interface InputGroupRef {
  clearInput: () => void;
}

const InputGroup = forwardRef<InputGroupRef, InputGroupProps>(({
                                                              icon,
                                                              placeholder,
                                                              setData
                                                            }: InputGroupProps, ref) => {

  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useMemo(
    () => debounce(setData, 1000), [setData]
  );

  const clearInput = () => {
    setSearch("");
  }

  useImperativeHandle(ref, () => ({
    clearInput
  }));

  return (
    <div className="flex items-center relative w-full">
      <Input type="text"
             placeholder={placeholder}
             onChange={event => {
               const newValue = event.target.value;
               setSearch(newValue);
               debouncedSearch(newValue);
             }}
             value={search}
             className="mr-2 py-[22]"
      />
      <FontAwesomeIcon icon={icon} className="absolute right-[20]" color="#6B7280"/>
    </div>
  )
})

InputGroup.displayName = "InputGroup"
export default InputGroup;
