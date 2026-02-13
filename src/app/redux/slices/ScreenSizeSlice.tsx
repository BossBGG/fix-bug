import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export const DESKTOP_SCREEN = "desktop";
export const MOBILE_SCREEN = "mobile";
export const TABLET_SCREEN = "tablet";
const initialState = DESKTOP_SCREEN

export const ScreenSizeSlice = createSlice({
  name: "screen_size",
  initialState,
  reducers: {
    setScreenSize: (_, action: PayloadAction<"desktop" | "mobile" | "tablet">) => action.payload,
  }
})

export const {setScreenSize} = ScreenSizeSlice.actions;
export default ScreenSizeSlice.reducer;
