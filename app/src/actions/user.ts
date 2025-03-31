import { store } from '../store';
import { userSliceActions } from '../store/user-slice';

export const doLogout = () => {
  store.dispatch(userSliceActions.logout());
};

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
  store.dispatch(userSliceActions.setToken(token));
};

export const setUser = (user: any) => {
  store.dispatch(userSliceActions.setUser(user));
  store.dispatch(userSliceActions.setAuthenticated(true));
};
