import { z } from "zod";
import { BucketPermission } from "../types";
import type { TUser } from "./user";

const ZedBucketPermission = z.object({
  id: z.number().int().positive(),
  bucketId: z.number().int().positive(),
  userId: z.number().int().positive(),
  permission: z.nativeEnum(BucketPermission),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

type TZedBucketPermission = z.infer<typeof ZedBucketPermission> & {
  _user: TUser | null;
};

type TBucketPermission = TZedBucketPermission & {};

export {
  type TBucketPermission,
  ZedBucketPermission,
  type TZedBucketPermission,
};
