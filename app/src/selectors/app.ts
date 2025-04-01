import { IRootState } from '../store';

export const currentTimeSelector = (state: IRootState) => state.app.currentTime;
