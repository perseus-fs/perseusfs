import { Spinner } from '@/components/spinner';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { getApiUrl } from '@/helpers/get-api-url';
import { useToken } from '@/hooks/use-token';
import { FileHeader, TErrors } from '@perseusfs/shared';
import { DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { filesize } from 'filesize';
import { debounce } from 'lodash';
import { CloudAlert, FileCheck2, Hourglass } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { TDialogProps } from '..';

type TFile = {
  nativeFile: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errors: TErrors | undefined;
};

type TFileStatusProps = {
  status: TFile['status'];
  message?: string;
};

const FileStatus = memo(({ status, message }: TFileStatusProps) => {
  if (status === 'pending') {
    return (
      <Tooltip content="Pending">
        <Hourglass size="1rem" />
      </Tooltip>
    );
  }

  if (status === 'uploading') {
    return (
      <Tooltip content="Uploading">
        <Spinner size="1rem" />
      </Tooltip>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-500">{message}</span>
        <Tooltip content="Error">
          <CloudAlert size="1rem" className="text-red-500" />
        </Tooltip>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <Tooltip content="File uploaded successfully">
        <FileCheck2 size="1rem" className="text-green-600" />
      </Tooltip>
    );
  }

  return null;
});

type TFileItemProps = {
  file: TFile;
};

const FileItem = memo(({ file }: TFileItemProps) => {
  // the errors come with the standard structure, but here we don't care about the fields, only the message
  const message = useMemo(() => {
    if (file.errors) {
      return Object.values(file.errors)[0];
    }

    return undefined;
  }, [file.errors]);

  return (
    <div className="flex items-center justify-between p-1 border-2 border-border rounded-lg">
      <div className="flex flex-col w-[90%]">
        <span className="text-sm font-semibold truncate">
          {file.nativeFile.name}
        </span>
        <span className="text-xs">{filesize(file.nativeFile.size)}</span>
      </div>

      <div>
        <FileStatus status={file.status} message={message} />
      </div>
    </div>
  );
});

type TUploadFileDialogProps = {
  bucketId: number;
  onUploadSuccess: () => void;
} & TDialogProps;

const UploadFileDialog = memo(
  ({ bucketId, onUploadSuccess, ...dialogProps }: TUploadFileDialogProps) => {
    const token = useToken();
    const [files, setFiles] = useState<TFile[]>([]);

    const onUploadSuccessDebounced = useMemo(() => {
      return debounce(onUploadSuccess, 1000);
    }, [onUploadSuccess]);

    const updateFile = useCallback(
      (fileId: string, newFile: Partial<TFile>) => {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === fileId ? { ...file, ...newFile } : file
          )
        );
      },
      []
    );

    const uploadFile = useCallback(
      async (fileToUpload: TFile) => {
        const arrayBuffer = await fileToUpload.nativeFile.arrayBuffer();

        let newStatus: (typeof fileToUpload)['status'] = fileToUpload.status;
        let fileErrors: TErrors | undefined;

        // set status to uploading
        updateFile(fileToUpload.id, { status: 'uploading' });

        const response = await fetch(`${getApiUrl()}/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
            [FileHeader.FILENAME]: fileToUpload.nativeFile.name,
            [FileHeader.BUCKET_ID]: bucketId.toString()
          },
          body: arrayBuffer
        });

        if (response.ok) {
          newStatus = 'success';

          onUploadSuccessDebounced();
        } else {
          const { errors, error } = await response.json();

          newStatus = 'error';
          fileErrors = errors || [error];
        }

        updateFile(fileToUpload.id, {
          status: newStatus,
          errors: fileErrors
        });
      },
      [bucketId, onUploadSuccessDebounced, updateFile, token]
    );

    const prepareFiles = useCallback(
      async (newFiles: File[]) => {
        const preparedFiles: TFile[] = newFiles.map((file) => ({
          nativeFile: file,
          status: 'pending',
          id: Math.random().toString(36).substr(2, 9),
          errors: undefined
        }));

        setFiles([...files, ...preparedFiles]);

        const promises = preparedFiles.map((file) => uploadFile(file));

        await Promise.all(promises);
      },
      [files, uploadFile]
    );

    const handleFileChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
          prepareFiles(Array.from(event.target.files));
        }
      },
      [prepareFiles]
    );

    const handleDragOver = useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // Required to allow drop
        event.stopPropagation();
      },
      []
    );

    const handleDrop = useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.dataTransfer.files) {
          prepareFiles(Array.from(event.dataTransfer.files));
        }
      },
      [prepareFiles]
    );

    return (
      <Dialog {...dialogProps}>
        <DialogContent>
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Upload files</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div
            className="flex justify-center items-center border-2 border-dashed border-gray-400 p-4 text-center cursor-pointer h-40 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <span className="text-sm text-muted-foreground">
              Click or drag files here to upload
            </span>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
              {files.map((file) => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

export { UploadFileDialog };
