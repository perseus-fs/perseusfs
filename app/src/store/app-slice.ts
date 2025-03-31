import { createSlice } from '@reduxjs/toolkit';

export interface IAppState {
  currentTime: number;
}

const initialState: IAppState = {
  currentTime: 0
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    }
  }
});

export const appSliceActions = appSlice.actions;

export default appSlice.reducer;
