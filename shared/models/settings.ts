import { z } from "zod";

export enum SettingKey {
  MAX_REQUEST_SIZE = "maxRequestSize",
  CORS_ALLOW_ORIGIN = "corsAllowOrigin",
  EXTRA_HEADERS = "extraHeaders",
  EXTRA_CODE = "extraCode",
  MAX_DISK_USAGE = "maxDiskUsage",
  DEMO_MODE = "demoMode",
  REQUEST_LOGS_RETENTION = "requestLogsRetention",
}

const ZedSettings = z.object({
  [SettingKey.MAX_REQUEST_SIZE]: z.number().int().nonnegative(),
  [SettingKey.CORS_ALLOW_ORIGIN]: z.string(),
  [SettingKey.EXTRA_HEADERS]: z.record(z.string()),
  [SettingKey.EXTRA_CODE]: z.string(),
  [SettingKey.MAX_DISK_USAGE]: z.number().int().nonnegative(),
  [SettingKey.DEMO_MODE]: z.boolean(),
  [SettingKey.REQUEST_LOGS_RETENTION]: z.number().int().nonnegative(),
});

type TZedSettings = z.infer<typeof ZedSettings>;

type TSettings = TZedSettings & {};

export { type TSettings, ZedSettings, type TZedSettings };
