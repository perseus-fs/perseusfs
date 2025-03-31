import { createSlice } from '@reduxjs/toolkit';

export interface IAppState {
  currentTime: number;
  updateSidebarCount: number;
}

const initialState: IAppState = {
  currentTime: 0,
  updateSidebarCount: 0
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    },
    incrementUpdateSidebarCount: (state) => {
      state.updateSidebarCount += 1;
    }
  }
});

export const appSliceActions = appSlice.actions;

export default appSlice.reducer;
