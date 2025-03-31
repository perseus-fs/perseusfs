export type TGenericObject = {
  [key: string]: any;
};

export type TErrors = { [key: string]: string };

export enum IOPermission {
  PUBLIC = "public",
  PRIVATE = "private",
  CUSTOM = "custom",
}

export enum RetentionPolicy {
  NEVER_DELETE = "never-delete",
  DISPOSE = "dispose",
}

export enum QuotaPolicy {
  UNLIMITED = "unlimited",
  LIMITED = "limited",
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum FileHeader {
  FILENAME = "X-Filename",
  BUCKET_ID = "X-Bucket-Id",
  METADATA = "X-Metadata",
  CONTENT_TYPE = "Content-Type",
}

export enum BucketPermission {
  OWNER = "owner",
  READ = "read",
  WRITE = "write",
  READ_WRITE = "read-write",
}

export const BUCKET_PERMISSION_DICTIONARY = {
  [BucketPermission.OWNER]: "Owner",
  [BucketPermission.READ]: "Read",
  [BucketPermission.WRITE]: "Write",
  [BucketPermission.READ_WRITE]: "Read & Write",
};

export type TUserBucketPermissions = {
  readPermission: boolean;
  writePermission: boolean;
  managePermission: boolean;
  isOwner: boolean;
};

export const DEFAULT_USER_PERMISSIONS: TUserBucketPermissions = {
  readPermission: false,
  writePermission: false,
  managePermission: false,
  isOwner: false,
};

export type TMetrics = {
  dbSize: number;
  logsCount: number;
  filesCount: number;
  filesSize: number;
  bucketsCount: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
  cpuUsage: number;
  logsStats: { status: number; count: number }[];
};

export enum InterfaceTag {
  API_HOST = "<!-- API_HOST -->",
  EXTRA_CODE = "<!-- EXTRA_CODE -->",
}
