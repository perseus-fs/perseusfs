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
  public createdAt!: number;
  public updatedAt!: number;

  public static createTable() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS buckets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        read TEXT NOT NULL,
        write TEXT NOT NULL,
        customRead TEXT,
        customWrite TEXT,
        quota INTEGER,
        retention INTEGER,
        quotaPolicy TEXT,
        retentionPolicy TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);
  }

  public static dropTable() {
    db.exec('DROP TABLE IF EXISTS buckets');
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

    return query.get({ id: bucketId });
  }

  public static findAll() {
    const query = db.query('SELECT * FROM buckets').as(Bucket);

    return query.all();
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

    return query.all({ userId });
  }

  public static findByName(name: string) {
    const query = db
      .query('SELECT * FROM buckets WHERE name = $name')
      .as(Bucket);

    return query.get({ name });
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
        'INSERT INTO buckets (name, read, write, customRead, customWrite, quota, retention, quotaPolicy, retentionPolicy, createdAt, updatedAt) VALUES ($name, $read, $write, $customRead, $customWrite, $quota, $retention, $quotaPolicy, $retentionPolicy, $createdAt, $updatedAt)'
      )
      .as(Bucket);

    const { lastInsertRowid: newBucketId } = query.run({
      name: bucket.name!,
      read: bucket.read!,
      write: bucket.write!,
      quota: bucket.quota!,
      customRead: bucket.customRead!,
      customWrite: bucket.customWrite!,
      retention: bucket.retention!,
      quotaPolicy: bucket.quotaPolicy!,
      retentionPolicy: bucket.retentionPolicy!,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

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
        updatedAt = $updatedAt
      WHERE id = $id
    `
      )
      .as(Bucket);

    query.run({
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
      id: bucketId,
      updatedAt: Date.now()
    });

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
