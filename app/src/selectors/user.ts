import { createSelector } from '@reduxjs/toolkit';
import { IRootState } from '../store';

export const userSelector = (state: IRootState) => state.user.user;

export const tokenSelector = (state: IRootState) => state.user.token;

export const authenticatedSelector = (state: IRootState) =>
  state.user.authenticated;

export const isSuperUserSelector = createSelector([userSelector], (user) => {
  if (!user) return false;

  return user.id === 1;
});
