import { queryClient } from '@/query-client';
import { store } from '@/store';
import { appSliceActions } from '@/store/app-slice';

export const invalidateBuckets = () => {
  queryClient.invalidateQueries({
    queryKey: ['buckets']
  });
};

export const invalidateBucket = (bucketId: number) => {
  invalidateBuckets();
  queryClient.invalidateQueries({
    queryKey: ['bucket', bucketId]
  });
};

export const invalidateUsers = () => {
  queryClient.invalidateQueries({
    queryKey: ['users']
  });
};

export const invalidateUser = (userId: number) => {
  invalidateUsers();
  queryClient.invalidateQueries({
    queryKey: ['user', userId]
  });
};

export const setDemoMode = (demoMode: boolean) => {
  store.dispatch(appSliceActions.setDemoMode(demoMode));
};
