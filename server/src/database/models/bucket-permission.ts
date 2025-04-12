import {
  BucketPermission as EBucketPermission,
  validateObject,
  ZedBucketPermission,
  type TBucketPermission,
  type TUser
} from '@perseusfs/shared';
import { type TCreateResponse } from '../../types';
import { db } from '../db';

class BucketPermission {
  public id!: number;
  public bucketId!: number;
  public userId!: number;
  public _user!: TUser | null;
  public permission!: EBucketPermission;
  public createdAt!: number;
  public updatedAt!: number;

  private static parse(
    bucketPermission: BucketPermission | null
  ): BucketPermission | null {
    if (!bucketPermission) return null;

    const parsedUser: TUser | null = bucketPermission._user
      ? JSON.parse(bucketPermission._user as unknown as string)
      : null;

    return Object.assign(new BucketPermission(), bucketPermission, {
      _user: parsedUser
    });
  }

  static createTable() {
    db.exec(`
      CREATE TABLE bucket_permissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bucketId INTEGER NOT NULL,
          userId INTEGER NOT NULL,
          permission TEXT NOT NULL CHECK (permission IN ('owner', 'read', 'write', 'read-write')),
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          FOREIGN KEY (bucketId) REFERENCES buckets(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE (bucketId, userId)
      );
    `);
  }

  static dropTable() {
    db.exec('DROP TABLE IF EXISTS bucket_permissions');
  }

  static create(
    bucketPermission: Partial<TBucketPermission>
  ): TCreateResponse<number | bigint> {
    const errors = validateObject(bucketPermission, ZedBucketPermission);

    if (errors) {
      return [undefined, errors];
    }

    const query = db
      .query(
        'INSERT INTO bucket_permissions (bucketId, userId, permission, createdAt, updatedAt) VALUES ($bucketId, $userId, $permission, $createdAt, $updatedAt)'
      )
      .as(BucketPermission);

    const { lastInsertRowid } = query.run({
      bucketId: bucketPermission.bucketId ?? 0,
      userId: bucketPermission.userId ?? 0,
      permission: bucketPermission.permission ?? EBucketPermission.READ,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return [lastInsertRowid, undefined];
  }

  static findAllByBucketId(bucketId: number) {
    const query = db
      .query(
        `SELECT bucket_permissions.*, 
        CASE 
          WHEN users.id IS NOT NULL THEN json_object(
            'id', users.id,
            'name', users.name,
            'email', users.email
          )
          ELSE NULL
        END AS _user
        FROM bucket_permissions 
        LEFT JOIN users ON bucket_permissions.userId = users.id 
        WHERE bucket_permissions.bucketId = $bucketId`
      )
      .as(BucketPermission);

    return query.all({ bucketId }).map(BucketPermission.parse);
  }

  static findAll(): BucketPermission[] {
    const query = db
      .query(
        `SELECT bucket_permissions.*, 
        CASE 
          WHEN users.id IS NOT NULL THEN json_object(
            'id', users.id,
            'name', users.name,
            'email', users.email
          )
          ELSE NULL
        END AS _user
        FROM bucket_permissions 
        LEFT JOIN users ON bucket_permissions.userId = users.id`
      )
      .as(BucketPermission);

    return query
      .all()
      .map(BucketPermission.parse)
      .filter((bp) => !!bp);
  }

  static getUserPermissionByBucketId(
    userId: number | undefined,
    bucketId: number | undefined
  ) {
    if (!userId || !bucketId) {
      return null;
    }

    const query = db
      .query(
        `SELECT bucket_permissions.*, 
        CASE 
          WHEN users.id IS NOT NULL THEN json_object(
            'id', users.id,
            'name', users.name,
            'email', users.email
          )
          ELSE NULL
        END AS _user
        FROM bucket_permissions 
        LEFT JOIN users ON bucket_permissions.userId = users.id 
        WHERE bucket_permissions.userId = $userId AND bucket_permissions.bucketId = $bucketId`
      )
      .as(BucketPermission);

    return query.get({ userId, bucketId });
  }

  static deleteAllByBucketId(bucketId: number) {
    const query = db.query(
      'DELETE FROM bucket_permissions WHERE bucketId = $bucketId'
    );

    return query.run({ bucketId });
  }

  static findById(id: number) {
    const query = db
      .query(
        `SELECT bucket_permissions.*,
        CASE 
          WHEN users.id IS NOT NULL THEN json_object(
            'id', users.id,
            'name', users.name,
            'email', users.email
          )
          ELSE NULL
        END AS _user
        FROM bucket_permissions
        LEFT JOIN users ON bucket_permissions.userId = users.id
        WHERE bucket_permissions.id = $id`
      )
      .as(BucketPermission);

    return this.parse(query.get({ id }));
  }

  static findByUserIdAndBucketId(
    userId: number,
    bucketId: number
  ): BucketPermission | null {
    const query = db
      .query(
        `SELECT bucket_permissions.*, 
        CASE 
          WHEN users.id IS NOT NULL THEN json_object(
            'id', users.id,
            'name', users.name,
            'email', users.email
          )
          ELSE NULL
        END AS _user
        FROM bucket_permissions 
        LEFT JOIN users ON bucket_permissions.userId = users.id 
        WHERE bucket_permissions.userId = $userId AND bucket_permissions.bucketId = $bucketId`
      )
      .as(BucketPermission);

    return query.get({ userId, bucketId });
  }

  static update(
    bucketPermissionId: number,
    bucketPermission: Partial<BucketPermission>
  ): TCreateResponse<boolean> {
    const errors = validateObject(bucketPermission, ZedBucketPermission);

    if (errors) {
      return [false, errors];
    }

    const query = db.query(
      'UPDATE bucket_permissions SET permission = $permission, updatedAt = $updatedAt WHERE id = $id'
    );

    query.run({
      id: bucketPermissionId,
      permission: bucketPermission.permission!,
      updatedAt: Date.now()
    });

    return [true, undefined];
  }

  public delete() {
    const query = db.query('DELETE FROM bucket_permissions WHERE id = $id');

    query.run({ id: this.id });
  }

  public toJSON() {
    return {
      id: this.id,
      bucketId: this.bucketId,
      userId: this.userId,
      permission: this.permission,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      _user: this._user
    };
  }
}

export { BucketPermission };
