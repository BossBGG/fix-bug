import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface LoadingState {
  is_loading: boolean
}

const initialState: LoadingState = {
  is_loading: false,
}

export const LoadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading: (state: LoadingState, action: PayloadAction<boolean>) => {
      state.is_loading = action.payload;
    }
  }
})

export const {setLoading} = LoadingSlice.actions;
export default LoadingSlice.reducer;
