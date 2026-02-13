import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Options} from "@/types";

const initialState = {
  peaOfficeOptions: [] as Options[],
  serviceTypeOptions: [] as Options[]
}

export const OptionSlice = createSlice({
  name: "option",
  initialState,
  reducers: {
    setPeaOfficeOption: (_, action: PayloadAction<Options[]>) => {
      _.peaOfficeOptions = action.payload;
    },
    setServiceTypeOption: (_, action: PayloadAction<Options[]>) => {
      _.serviceTypeOptions = action.payload;
    }
  }
})

export const { setPeaOfficeOption, setServiceTypeOption } = OptionSlice.actions;
export default OptionSlice.reducer;
