import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>): void => {
      state.token = action.payload;
      // console.log('AuthSlice set token >>>> ', action.payload)
    },
    clearToken: (state): void => {
      state.token = null;
    },
  },
});

export const { setToken, clearToken } = AuthSlice.actions;
export default AuthSlice.reducer;
