import { configureStore } from '@reduxjs/toolkit';
import appSlice from './app-slice';
import dialogSlice from './dialog-slice';
import userSlice from './user-slice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    app: appSlice,
    dialog: dialogSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type IRootState = ReturnType<typeof store.getState>;
