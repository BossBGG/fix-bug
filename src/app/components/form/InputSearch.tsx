import InputGroup, {InputGroupRef} from "@/app/components/form/InputGroup";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {forwardRef, useImperativeHandle, useRef} from "react";

type InputSearchProps = {
  handleSearch: (search: string) => void;
  placeholder?: string;
}

export interface InputSearchRef {
  clearSearch: () => void;
}

const InputSearch = forwardRef<InputSearchRef, InputSearchProps>(({
                                                    handleSearch,
                                                    placeholder
                                                  } : InputSearchProps, ref) => {

  const inputRef = useRef<InputGroupRef>(null);
  const clearSearch = () => {
    inputRef.current?.clearInput();
  }

  useImperativeHandle(ref, () => ({
    clearSearch
  }))

  return (
    <InputGroup
      icon={faSearch}
      placeholder={placeholder || "ค้นหา"}
      setData={handleSearch}
      ref={inputRef}
    />
  )
})

InputSearch.displayName = "InputSearch";
export default InputSearch;
