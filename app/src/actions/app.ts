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

export const setDemoMode = (demoMode: boolean) => {
  store.dispatch(appSliceActions.setDemoMode(demoMode));
};
