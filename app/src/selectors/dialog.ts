import { createSelector } from '@reduxjs/toolkit';

export const openDialogSelector = (state) => state.dialog.openDialog;

export const dialogPropsSelector = (state) => state.dialog.props;

export const dialogOpenSelector = (state) => state.dialog.open;

export const dialogInfoSelector = createSelector(
  openDialogSelector,
  dialogPropsSelector,
  dialogOpenSelector,
  (openDialog, props, open) => ({ openDialog, props, open })
);
