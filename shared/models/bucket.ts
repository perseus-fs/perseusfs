import { z } from "zod";
import { IOPermission, QuotaPolicy, RetentionPolicy } from "../types";

const ZedBucket = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .regex(
      /^[a-z0-9-_]+$/,
      "Name can only contain lowercase letters, numbers, hyphens, and underscores"
    ),
  read: z.nativeEnum(IOPermission),
  customRead: z
    .string()
    .min(1, "Custom read permission cannot be empty")
    .nullable(),
  write: z.nativeEnum(IOPermission),
  customWrite: z
    .string()
    .min(1, "Custom write permission cannot be empty")
    .nullable(),
  quotaPolicy: z.nativeEnum(QuotaPolicy),
  quota: z.number().positive().nullable(),
  retentionPolicy: z.nativeEnum(RetentionPolicy),
  retention: z.number().positive().nullable(),
  extraHeaders: z.record(z.string()),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

type TZedBucket = z.infer<typeof ZedBucket>;

type TBucket = TZedBucket & {};

export { type TBucket, ZedBucket, type TZedBucket };
