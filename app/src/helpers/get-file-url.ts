import { getApiUrl } from './get-api-url';

const getFileUrl = (bucketName: string, name: string, path: string | null) => {
  return `${getApiUrl()}/${bucketName}/${path ? `${path}/` : ''}${name}`;
};

export { getFileUrl };
