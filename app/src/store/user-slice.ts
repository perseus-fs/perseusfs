import { TUser } from '@perseusfs/shared';
import { createSlice } from '@reduxjs/toolkit';

export interface IUserState {
  token?: string;
  id?: string;
  email?: string;
  exp?: number;
  iat?: number;
  authenticated: boolean;
  user: TUser | undefined;
}

const initialState: IUserState = {
  token: localStorage.getItem('token') || undefined,
  id: undefined,
  email: undefined,
  exp: undefined,
  iat: undefined,
  authenticated: false,
  user: undefined
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAuthenticated: (state, action) => {
      state.authenticated = action.payload;
    },
    logout: (state) => {
      state.token = undefined;
      state.authenticated = false;
      state.user = undefined;

      localStorage.removeItem('token');
    }
  }
});

export const userSliceActions = userSlice.actions;

export default userSlice.reducer;
