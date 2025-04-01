import { closeDialog } from '@/actions/dialog';
import { useDialogInfo } from '@/hooks/use-dialog-info';
import { memo } from 'react';
import { ActionConfirmDialog } from './action-confirm';
import { CreatePermissionDialog } from './create-permission';
import { ShareFileDialog } from './share-file';
import { UploadFileDialog } from './upload-file';

enum Dialog {
  UPLOAD_FILES = 'UPLOAD_FILES',
  ACTION_CONFIRM = 'ACTION_CONFIRM',
  CREATE_PERMISSION = 'CREATE_PERMISSION',
  SHARE_FILE = 'SHARE_FILE'
}

type TDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const Dialogs = {
  [Dialog.UPLOAD_FILES]: UploadFileDialog,
  [Dialog.ACTION_CONFIRM]: ActionConfirmDialog,
  [Dialog.CREATE_PERMISSION]: CreatePermissionDialog,
  [Dialog.SHARE_FILE]: ShareFileDialog
};

const DialogProvider = memo(() => {
  const dialogInfo = useDialogInfo();

  if (!dialogInfo.openDialog) {
    return null;
  }

  const DialogComponent = Dialogs[dialogInfo.openDialog];

  return (
    <DialogComponent
      {...dialogInfo.props}
      open={dialogInfo.open}
      onOpenChange={(open) => {
        if (!open) {
          closeDialog();
        }
      }}
    />
  );
});

export { Dialog, DialogProvider, type TDialogProps };
