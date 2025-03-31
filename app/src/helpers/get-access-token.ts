import { tokenSelector } from '@/selectors/user';
import { store } from '@/store';

export const getAccessToken = async (): Promise<string | undefined> => {
  const state = store.getState();
  const token = tokenSelector(state);

  return token;
};
