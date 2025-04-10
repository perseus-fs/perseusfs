import { createSelector } from '@reduxjs/toolkit';
import { IRootState } from '../store';
import { isSuperUserSelector } from './user';

export const demoModeSelector = (state: IRootState) => state.app.demoMode;

export const isDemoModeLockedSelector = createSelector(
  [isSuperUserSelector, demoModeSelector],
  (isSuperUser, demoMode) => {
    return demoMode && !isSuperUser;
  }
);
