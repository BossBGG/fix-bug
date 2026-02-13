import {User} from "@/types";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState: User = {} as User;

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (_, action: PayloadAction<User>) => action.payload,
    clearUserProfile: () => ({} as User)
  }
})

export const { setUserProfile, clearUserProfile } = UserSlice.actions;
export default UserSlice.reducer;
