import { Dialog } from '@/components/dialogs';
import { store } from '../store';
import { dialogSliceActions, IDialogState } from '../store/dialog-slice';

export const openDialog = (dialog: Dialog, props: IDialogState['props']) => {
  store.dispatch(dialogSliceActions.openDialog({ dialog, props }));
};

export const closeDialog = () => {
  store.dispatch(dialogSliceActions.closeDialog());

  // allow for the dialog to fade out before resetting the dialog
  setTimeout(() => {
    store.dispatch(dialogSliceActions.resetDialog());
  }, 300);
};

export const requestConfirmation = async ({
  title,
  message,
  confirmLabel,
  cancelLabel
}: {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) => {
  return new Promise<boolean>((resolve) => {
    openDialog(Dialog.ACTION_CONFIRM, {
      message,
      title,
      confirmLabel,
      cancelLabel,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
};
