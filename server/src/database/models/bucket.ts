import {
  BucketPermission as EBucketPermission,
  IOPermission,
  QuotaPolicy,
  RetentionPolicy,
  UserRole,
  validateObject,
  ZedBucket,
  type TBucket
} from '@perseusfs/shared';
import fs from 'fs';
import path from 'path';
import type { TCreateResponse } from '../../types';
import { BUCKETS_PATH, db } from '../db';
import { BucketPermission } from './bucket-permission';
import { File } from './file';

class Bucket implements TBucket {
  public id!: number;
  public name!: string;
  public read!: IOPermission;
  public customRead!: string | null;
  public write!: IOPermission;
  public customWrite!: string | null;
  public quotaPolicy!: QuotaPolicy;
  public quota!: number | null;
  public retentionPolicy!: RetentionPolicy;
  public retention!: number | null;
  public extraHeaders!: Record<string, string>;
  public createdAt!: number;
  public updatedAt!: number;

  public static dropTable() {
    db.exec('DROP TABLE IF EXISTS buckets');
  }

  private static parse(bucket: Bucket | null): Bucket | null {
    if (!bucket) return null;

    const parsedExtraHeaders = JSON.parse(
      bucket.extraHeaders.toString() || '{}'
    );

    return Object.assign(new Bucket(), bucket, {
      extraHeaders: parsedExtraHeaders
    });
  }

  public static getCount() {
    const countQuery = `
      SELECT COUNT(*) as count FROM buckets
    `;

    const count = db.query(countQuery).get() as { count: number };

    return count.count;
  }

  public static findById(bucketId: number) {
    const query = db.query('SELECT * FROM buckets WHERE id = $id').as(Bucket);
    const bucket = query.get({ id: bucketId });

    return Bucket.parse(bucket);
  }

  public static findAll() {
    const query = db.query('SELECT * FROM buckets').as(Bucket);
    const buckets = query.all();

    return buckets.map(Bucket.parse);
  }

  public static findAllByUserId(userId: number | undefined) {
    if (!userId) {
      return [];
    }

    const query = db
      .query(
        `
          SELECT buckets.* 
          FROM buckets
          JOIN users ON users.id = $userId
          LEFT JOIN bucket_permissions 
            ON bucket_permissions.bucketId = buckets.id 
            AND bucket_permissions.userId = $userId
          WHERE users.id = $userId 
            AND (
              users.role = '${UserRole.ADMIN}' OR
              bucket_permissions.permission IN (
                '${EBucketPermission.OWNER}', 
                '${EBucketPermission.READ_WRITE}', 
                '${EBucketPermission.READ}'
              )
            )
        `
      )
      .as(Bucket);

    const buckets = query.all({ userId });

    return buckets.map(Bucket.parse);
  }

  public static findByName(name: string) {
    const query = db
      .query('SELECT * FROM buckets WHERE name = $name')
      .as(Bucket);
    const bucket = query.get({ name });

    return Bucket.parse(bucket);
  }

  public static getPath(name: string) {
    return path.join(BUCKETS_PATH, name);
  }

  public static create(bucket: Partial<Bucket>): TCreateResponse<number> {
    const errors = validateObject(bucket, ZedBucket);

    if (errors) {
      return [undefined, errors];
    }

    const existingBucket = Bucket.findByName(bucket.name!);

    if (existingBucket) {
      return [undefined, { name: 'Bucket with this name already exists' }];
    }

    const query = db
      .query(
        `INSERT INTO buckets (
      name,
      read,
      write,
      customRead,
      customWrite,
      quota,
      retention,
      quotaPolicy,
      retentionPolicy,
      extraHeaders,
      createdAt,
      updatedAt
    ) VALUES (
      $name,
      $read,
      $write,
      $customRead,
      $customWrite,
      $quota,
      $retention,
      $quotaPolicy,
      $retentionPolicy,
      $extraHeaders,
      $createdAt,
      $updatedAt
    )`
      )
      .as(Bucket);

    const execQuery = {
      name: bucket.name!,
      read: bucket.read!,
      write: bucket.write!,
      quota: bucket.quota!,
      customRead: bucket.customRead!,
      customWrite: bucket.customWrite!,
      retention: bucket.retention!,
      quotaPolicy: bucket.quotaPolicy!,
      retentionPolicy: bucket.retentionPolicy!,
      extraHeaders: JSON.stringify(bucket.extraHeaders ?? {}),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const { lastInsertRowid: newBucketId } = query.run(execQuery);

    const bucketPath = Bucket.getPath(bucket.name!);

    if (!fs.existsSync(bucketPath)) {
      fs.mkdirSync(bucketPath);
    }

    return [Number(newBucketId), undefined];
  }

  public static update(
    bucketId: number,
    bucket: Partial<Bucket>
  ): TCreateResponse<boolean> {
    const existingBucket = Bucket.findById(bucketId);

    if (!existingBucket) {
      return [false, { name: 'Bucket not found' }];
    }

    const errors = validateObject(bucket, ZedBucket);

    if (errors) {
      return [false, errors];
    }

    const newData: Partial<Bucket> = {
      ...bucket
    };

    const existingBucketName = Bucket.findByName(newData.name!);

    if (existingBucketName && existingBucketName.id !== bucketId) {
      return [false, { name: 'Bucket with this name already exists' }];
    }

    const isRename = bucket.name && bucket.name !== existingBucket.name;

    if (isRename) {
      const oldBucketPath = Bucket.getPath(existingBucket.name);
      const newBucketPath = Bucket.getPath(bucket.name!);

      if (fs.existsSync(oldBucketPath)) {
        fs.renameSync(oldBucketPath, newBucketPath);
      }
    }

    const query = db
      .query(
        `
      UPDATE buckets
      SET
        name = $name,
        read = $read,
        write = $write,
        customRead = $customRead,
        customWrite = $customWrite,
        quota = $quota,
        retention = $retention,
        quotaPolicy = $quotaPolicy,
        retentionPolicy = $retentionPolicy,
        extraHeaders = $extraHeaders,
        updatedAt = $updatedAt
      WHERE id = $id
    `
      )
      .as(Bucket);

    const execUpdateQuery = {
      name: newData.name ?? existingBucket.name,
      read: newData.read ?? existingBucket.read,
      write: newData.write ?? existingBucket.write,
      quota: newData.quota ?? existingBucket.quota,
      customRead: newData.customRead ?? existingBucket.customRead,
      customWrite: newData.customWrite ?? existingBucket.customWrite,
      retention: bucket.retention ?? existingBucket.retention,
      quotaPolicy: newData.quotaPolicy ?? existingBucket.quotaPolicy,
      retentionPolicy:
        newData.retentionPolicy ?? existingBucket.retentionPolicy,
      extraHeaders: JSON.stringify(
        newData.extraHeaders ?? existingBucket.extraHeaders
      ),
      id: bucketId,
      updatedAt: Date.now()
    };

    query.run(execUpdateQuery);

    return [true, undefined];
  }

  public addPermission(
    userId: number,
    permission: EBucketPermission | undefined
  ) {
    return BucketPermission.create({
      bucketId: this.id,
      userId,
      permission
    });
  }

  public removePermission(permissionId: number) {
    const permission = BucketPermission.findById(permissionId);

    if (!permission) {
      return;
    }

    return permission.delete();
  }

  public delete() {
    const query = db.query('DELETE FROM buckets WHERE id = $id');

    query.run({ id: this.id });

    const bucketPath = Bucket.getPath(this.name);

    if (fs.existsSync(bucketPath)) {
      fs.rmdirSync(bucketPath, { recursive: true });
    }

    BucketPermission.deleteAllByBucketId(this.id);
    File.deleteAllByBucketId(this.id);
  }

  public getPermissions() {
    return BucketPermission.findAllByBucketId(this.id);
  }
}

export { Bucket };
