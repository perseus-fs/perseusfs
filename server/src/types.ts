import type { User } from './database/models/user';

export type TErrors = { [key: string]: string } | undefined;

export type TGenericObject<T = any> = { [key: string]: T };

export type TCreateResponse<T = boolean> = [T | undefined, TErrors];

export type TCustomRequest = Request & {
  user?: User;
  params: TGenericObject<string>;
};

export type TRes = (body: TGenericObject, status?: number) => Response;

export type TErr = (errors: TErrors, status?: number) => Response;

export type TBuildInfo = {
  version: string;
  date: number;
  env: 'development' | 'production';
};

export enum CustomHeaders {
  X_PoweredBy = 'X-Powered-By',
  X_ServerVersion = 'X-Server-Version'
}
