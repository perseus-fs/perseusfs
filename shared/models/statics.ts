import { z } from "zod";

export enum StaticKey {
  JWT_SECRET = "jwtSecret",
  SIGNED_URL_SECRET = "signedUrlSecret",
  FIRST_START_DATE = "firstStartDate",
  FIRST_START_VERSION = "firstStartVersion",
  FIRST_START_DB_VERSION = "firstStartDbVersion",
}

const ZedStatics = z.object({
  [StaticKey.JWT_SECRET]: z.string().min(1),
  [StaticKey.SIGNED_URL_SECRET]: z.string().min(1),
  [StaticKey.FIRST_START_DATE]: z.number().int().nonnegative(),
  [StaticKey.FIRST_START_VERSION]: z.string().min(1),
  [StaticKey.FIRST_START_DB_VERSION]: z.number().int().nonnegative(),
});

type TZedStatics = z.infer<typeof ZedStatics>;

type TStatics = TZedStatics & {};

export { type TStatics, ZedStatics, type TZedStatics };
