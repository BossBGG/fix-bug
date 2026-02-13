import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ServiceRequest} from "@/types";

const initialState: ServiceRequest = {} as ServiceRequest;

export const CustomerRequestSlice = createSlice({
  name: "CustomerRequestSlice",
  initialState,
  reducers: {
    setCustomerRequestData: (state, action: PayloadAction<ServiceRequest>) => {
      return action.payload;
    },
    clearCustomerRequestData: () => {
      return initialState
    }
  }
})

export const {setCustomerRequestData, clearCustomerRequestData} = CustomerRequestSlice.actions;
export default CustomerRequestSlice.reducer;
