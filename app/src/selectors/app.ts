import { IRootState } from '../store';

export const currentTimeSelector = (state: IRootState) => state.app.currentTime;

export const updateSidebarCountSelector = (state: IRootState) =>
  state.app.updateSidebarCount;
