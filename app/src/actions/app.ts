import { store } from '@/store';
import { appSliceActions } from '@/store/app-slice';

export const setCurrentTime = (currentTime: number) => {
  store.dispatch(appSliceActions.setCurrentTime(currentTime));
};

export const updateSidebar = () => {
  store.dispatch(appSliceActions.incrementUpdateSidebarCount());
};
