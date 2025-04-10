import { createSlice } from '@reduxjs/toolkit';

export interface IAppState {
  demoMode: boolean;
}

const initialState: IAppState = {
  demoMode: false
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setDemoMode: (state, action) => {
      state.demoMode = action.payload;
    }
  }
});

export const appSliceActions = appSlice.actions;

export default appSlice.reducer;
