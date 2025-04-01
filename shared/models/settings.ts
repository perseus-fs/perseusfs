import { z } from "zod";

export enum SettingKey {
  MAX_REQUEST_SIZE = "maxRequestSize",
  CORS_ALLOW_ORIGIN = "corsAllowOrigin",
  EXTRA_HEADERS = "extraHeaders",
  EXTRA_CODE = "extraCode",
  MAX_DISK_USAGE = "maxDiskUsage",
  JWT_SECRET = "jwtSecret",
  SIGNED_URL_SECRET = "signedUrlSecret",
}

const ZedSettings = z.object({
  [SettingKey.MAX_REQUEST_SIZE]: z.number().int().nonnegative(),
  [SettingKey.CORS_ALLOW_ORIGIN]: z.string(),
  [SettingKey.EXTRA_HEADERS]: z.record(z.string()),
  [SettingKey.EXTRA_CODE]: z.string(),
  [SettingKey.MAX_DISK_USAGE]: z.number().int().nonnegative(),
  [SettingKey.JWT_SECRET]: z.string(),
  [SettingKey.SIGNED_URL_SECRET]: z.string(),
});

type TZedSettings = z.infer<typeof ZedSettings>;

type TSettings = TZedSettings & {};

export { type TSettings, ZedSettings, type TZedSettings };
