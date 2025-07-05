import {
  QuotaPolicy,
  RetentionPolicy,
  SettingKey,
  validateObject,
  ZedFile,
  type TUser
} from '@perseusfs/shared';
import { parse } from 'file-type-mime';
import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import { getFileHash } from '../../helpers/get-file-hash';
import type { TCreateResponse } from '../../types';
import { db } from '../db';
import { Bucket } from './bucket';
import { Settings } from './settings';

class File {
  public id!: number | bigint;
  public bucketId!: number;
  public name!: string;
  public path!: string;
  public originalName!: string;
  public size!: number;
  public contentType!: string;
  public uploadedBy!: number;
  public hash!: string;
  public _user!: TUser | null;
  public createdAt!: number;
  public updatedAt!: number;

  private static parse(file: File | null): File | null {
    if (!file) return null;

    const parsedUser: TUser | null = file._user
      ? JSON.parse(file._user as unknown as string)
      : null;

    return Object.assign(new File(), file, { _user: parsedUser });
  }

  public static getCount() {
    const countQuery = `
      SELECT COUNT(*) as count FROM files
    `;

    const count = db.query(countQuery).get() as { count: number };

    return count.count;
  }

  public static getFilesSize() {
    const sizeQuery = `
      SELECT SUM(size) as size FROM files
    `;

    const { size } = db.query(sizeQuery).get() as { size: number };

    return size;
  }

  public static getFilesSizeByBucketId(bucketId: number) {
    const sizeQuery = `
      SELECT SUM(size) as size FROM files WHERE bucketId = $bucketId
    `;

    const { size } = db.query(sizeQuery).get({ bucketId }) as { size: number };

    return size;
  }

  static getUniqueName(
    relativePath: string,
    baseName: string,
    extension: string,
    bucketId: number
  ) {
    let counter = 0;
    let candidate = `${baseName}${extension}`;

    const allFiles = File.findAllByBucketId(bucketId);

    while (
      allFiles.some(
        (file) =>
          file?.name === candidate && file.path === (relativePath || null)
      )
    ) {
      counter++;
      candidate = `${baseName}-${counter}${extension}`;
    }

    return candidate;
  }

  static dropTable() {
    db.exec('DROP TABLE IF EXISTS files');
  }

  static findAll() {
    const query = db
      .query(
        `SELECT files.*, 
                CASE 
                  WHEN users.id IS NOT NULL THEN json_object(
                    'id', users.id,
                    'name', users.name,
                    'email', users.email
                  )
                  ELSE NULL
                END AS _user
         FROM files 
         LEFT JOIN users ON files.uploadedBy = users.id`
      )
      .as(File);

    return query
      .all()
      .map(File.parse)
      .filter((file) => !!file);
  }

  static findByBucketAndKey(
    bucketId: number | undefined,
    name: string | undefined
  ) {
    if (!bucketId || !name) return null;

    const query = db
      .query(
        `SELECT files.*, 
                CASE 
                  WHEN users.id IS NOT NULL THEN json_object(
                    'id', users.id,
                    'name', users.name,
                    'email', users.email
                  )
                  ELSE NULL
                END AS _user
         FROM files 
         LEFT JOIN users ON files.uploadedBy = users.id 
         WHERE files.bucketId = $bucketId AND files.name = $name`
      )
      .as(File);

    const file = query.get({ bucketId, name });

    return File.parse(file);
  }

  static findAllByBucketId(bucketId: number) {
    const query = db
      .query(
        `SELECT files.*, 
                CASE 
                  WHEN users.id IS NOT NULL THEN json_object(
                    'id', users.id,
                    'name', users.name,
                    'email', users.email
                  )
                  ELSE NULL
                END AS _user
         FROM files 
         LEFT JOIN users ON files.uploadedBy = users.id 
         WHERE files.bucketId = $bucketId`
      )
      .as(File);

    return query.all({ bucketId }).map(File.parse);
  }

  static findDisposableFiles() {
    const query = db
      .query(
        `
      SELECT f.*
      FROM files f
      JOIN buckets b ON f.bucketId = b.id
      WHERE b.retentionPolicy = '${RetentionPolicy.DISPOSE}'
        AND (
          (CAST(strftime('%s', 'now') AS INTEGER) - CAST(f.createdAt / 1000 AS INTEGER)) > b.retention
        )
    `
      )
      .as(File);

    const disposableFiles = query.all();

    return disposableFiles;
  }

  public isDisposable() {
    const bucket = Bucket.findById(this.bucketId);

    if (!bucket) {
      throw new Error('Bucket not found');
    }

    if (
      bucket.retentionPolicy !== RetentionPolicy.DISPOSE ||
      !bucket.retention
    ) {
      return false;
    }

    const currentTime = Date.now();
    const fileCreationTime = this.createdAt;

    return currentTime - fileCreationTime > bucket.retention;
  }

  static writeFile(
    data: ArrayBuffer,
    bucketId: number,
    uploadedBy: number | undefined,
    filePath: string
  ): {
    currentPath: string;
    fileName: string;
    fileId: number | bigint;
  } {
    const bucket = Bucket.findById(bucketId);

    if (!bucket) {
      throw new Error('Bucket not found');
    }

    const maxDiskUsage = Settings.get(SettingKey.MAX_DISK_USAGE);

    if (maxDiskUsage > 0) {
      const currentDiskUsage = this.getFilesSize();

      if (currentDiskUsage + data.byteLength > maxDiskUsage) {
        throw new Error('Disk usage limit exceeded');
      }
    }

    if (bucket.quotaPolicy === QuotaPolicy.LIMITED) {
      const currentDiskUsage = this.getFilesSizeByBucketId(bucketId);
      const bucketQuota = bucket.quota ?? 0;

      if (currentDiskUsage + data.byteLength > bucketQuota) {
        throw new Error('Bucket quota exceeded');
      }
    }

    const extension = path.extname(filePath);
    const originalName = path.basename(filePath);
    const relativePath =
      path.dirname(filePath) === '.' ? '' : path.dirname(filePath);
    const sanitizedName = sanitize(path.basename(filePath, extension));

    const finalName = File.getUniqueName(
      relativePath,
      sanitizedName,
      extension,
      bucketId
    );

    const bucketPath = path.join(Bucket.getPath(bucket.name), relativePath);

    if (!fs.existsSync(bucketPath)) {
      fs.mkdirSync(bucketPath, { recursive: true });
    }

    const absolutePath = path.join(bucketPath, finalName);
    const parsedMime = parse(data);

    const [fileId] = File.create({
      bucketId,
      name: finalName,
      originalName,
      size: data.byteLength,
      contentType: parsedMime?.mime ?? 'application/octet-stream',
      uploadedBy,
      path: relativePath || undefined,
      hash: getFileHash(data)
    });

    if (!fileId) {
      throw new Error('Failed to create file record in database');
    }

    fs.writeFileSync(absolutePath, Buffer.from(data));

    return {
      fileName: finalName,
      fileId,
      currentPath: path.posix.join(bucket.name, relativePath, finalName)
    };
  }

  static create(file: Partial<File>): TCreateResponse<bigint | number> {
    const errors = validateObject(file, ZedFile);

    if (errors) {
      return [undefined, errors];
    }

    const query = db
      .query(
        'INSERT INTO files (bucketId, name, originalName, size, contentType, uploadedBy, path, hash, createdAt, updatedAt) VALUES ($bucketId, $name, $originalName, $size, $contentType, $uploadedBy, $path, $hash, $createdAt, $updatedAt)'
      )
      .as(File);

    const { lastInsertRowid } = query.run({
      bucketId: file.bucketId ?? 0,
      name: file.name ?? '',
      originalName: file.originalName ?? '',
      size: file.size ?? 0,
      contentType: file.contentType ?? '',
      uploadedBy: file.uploadedBy ?? null,
      path: file.path ?? null,
      hash: file.hash ?? null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return [lastInsertRowid, undefined];
  }

  static deleteAllByBucketId(bucketId: number) {
    const files = File.findAllByBucketId(bucketId);

    files.forEach((file) => {
      file?.delete();
    });
  }

  static findById(id: number | bigint) {
    const query = db.query('SELECT * FROM files WHERE id = $id').as(File);

    return File.parse(query.get({ id }));
  }

  public getFullPath() {
    const bucket = Bucket.findById(this.bucketId);

    if (!bucket) {
      throw new Error('Bucket not found');
    }

    return path.posix.join(bucket.name, this.getPath());
  }

  public getPath() {
    return path.posix.join(this.path ?? '', this.name);
  }

  public delete() {
    const file = File.findById(this.id);

    if (!file) return false;

    const bucket = Bucket.findById(file.bucketId);

    if (!bucket) return;

    const filePath = path.join(
      Bucket.getPath(bucket.name),
      file.path ?? '',
      file.name
    );

    const query = db.query('DELETE FROM files WHERE id = $id');

    query.run({ id: this.id });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return true;
  }

  public getDiskUsage() {
    const query = db.query(
      'SELECT SUM(size) as size FROM files WHERE bucketId = $bucketId'
    );

    const { size } = query.get({ bucketId: this.bucketId }) as {
      size: number;
    };

    return size;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      hash: this.hash,
      bucketId: this.bucketId,
      user: this._user,
      originalName: this.originalName,
      size: this.size,
      contentType: this.contentType,
      uploadedBy: this.uploadedBy,
      path: this.path,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export { File };
