import { Dialog } from '@/components/dialogs';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IDialogState {
  openDialog: Dialog | undefined;
  props: Record<string, any>;
  open: boolean;
}

const initialState: IDialogState = {
  openDialog: undefined,
  props: {},
  open: false
};

export const dialogSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    openDialog: (
      state,
      action: PayloadAction<{ dialog: Dialog; props: IDialogState['props'] }>
    ) => {
      state.openDialog = action.payload.dialog;
      state.props = action.payload.props;
      state.open = true;
    },
    resetDialog: (state) => {
      state.openDialog = undefined;
      state.props = {};
    },
    closeDialog: (state) => {
      state.open = false;
    }
  }
});

export const dialogSliceActions = dialogSlice.actions;

export default dialogSlice.reducer;
