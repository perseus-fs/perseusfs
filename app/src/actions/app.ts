import { queryClient } from '@/query-client';
import { store } from '@/store';
import { appSliceActions } from '@/store/app-slice';

export const setCurrentTime = (currentTime: number) => {
  store.dispatch(appSliceActions.setCurrentTime(currentTime));
};

export const invalidateBuckets = () => {
  queryClient.invalidateQueries({
    queryKey: ['buckets']
  });
};

export const invalidateBucket = (bucketId: number) => {
  invalidateBuckets();
  queryClient.invalidateQueries({
    queryKey: ['buckets', bucketId]
  });
};
