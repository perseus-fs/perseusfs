import { BucketPermission } from "../types";

const hasWritePermission = (
  bucketPermission: BucketPermission | undefined | null
) =>
  bucketPermission === BucketPermission.READ_WRITE ||
  bucketPermission === BucketPermission.OWNER ||
  bucketPermission === BucketPermission.WRITE;

const hasReadPermission = (
  bucketPermission: BucketPermission | undefined | null
) =>
  bucketPermission === BucketPermission.READ_WRITE ||
  bucketPermission === BucketPermission.OWNER ||
  bucketPermission === BucketPermission.READ;

const isOwner = (bucketPermission: BucketPermission | undefined | null) =>
  bucketPermission === BucketPermission.OWNER;

export { hasWritePermission, hasReadPermission, isOwner };
