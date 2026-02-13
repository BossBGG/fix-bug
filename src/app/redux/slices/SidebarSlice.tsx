import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = true;

export const SidebarSlice = createSlice({
  name: 'sidebar_expand',
  initialState,
  reducers: {
    setExpandSidebar: (_, action: PayloadAction<boolean>) => action.payload,
  }
})

export const { setExpandSidebar } = SidebarSlice.actions;
export default SidebarSlice.reducer;
