import { tokenSelector } from '@/selectors/user';
import { store } from '@/store';

const downloadFile = async (url: string, filename: string): Promise<void> => {
  const state = store.getState();
  const token = tokenSelector(state);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status}`);
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(downloadUrl);
};

export { downloadFile };
