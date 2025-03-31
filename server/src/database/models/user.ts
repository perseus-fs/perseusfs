import {
  hasReadPermission,
  hasWritePermission,
  isOwner,
  UserRole,
  validateObject,
  ZedUser,
  type TUser,
  type TUserBucketPermissions
} from '@perseusfs/shared';
import type { TCreateResponse } from '../../types';
import { db } from '../db';
import { BucketPermission } from './bucket-permission';

class User implements TUser {
  public id!: number;
  public name!: string;
  public email!: string;
  public role!: UserRole;
  public password!: string;
  public lastSeen!: number;
  public createdAt!: number;
  public updatedAt!: number;

  static createTable() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE DEFAULT NULL,
        role TEXT NOT NULL DEFAULT '${UserRole.USER}',
        password TEXT NOT NULL,
        lastSeen INTEGER DEFAULT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);
  }

  static dropTable() {
    db.exec('DROP TABLE IF EXISTS users');
  }

  static findById(userId: number | undefined) {
    if (!userId) return undefined;

    const query = db.query('SELECT * FROM users WHERE id = $id').as(User);

    return query.get({ id: userId });
  }

  static findAll() {
    const query = db.query('SELECT * FROM users').as(User);

    return query.all();
  }

  static findByEmail(email: string) {
    const query = db.query('SELECT * FROM users WHERE email = $email').as(User);

    return query.get({ email });
  }

  static findByName(name: string) {
    const query = db.query('SELECT * FROM users WHERE name = $name').as(User);

    return query.get({ name });
  }

  static getCount() {
    const countQuery = `
      SELECT COUNT(*) as count FROM users
    `;

    const count = db.query(countQuery).get() as { count: number };

    return count.count;
  }

  static create(user: Partial<User>): TCreateResponse {
    const errors = validateObject(user, ZedUser);

    if (errors) {
      return [false, errors];
    }

    if (user.email) {
      const existingUser = User.findByEmail(user.email);

      if (existingUser) {
        return [false, { email: 'Email already in use' }];
      }
    }

    const existingUser = User.findByName(user.name ?? '');

    if (existingUser) {
      return [false, { name: 'Name already in use' }];
    }

    const query = db
      .query(
        'INSERT INTO users (name, email, password, role, createdAt, updatedAt) VALUES ($name, $email, $password, $role, $createdAt, $updatedAt)'
      )
      .as(User);

    query.run({
      name: user.name ?? null,
      email: user.email ?? null,
      role: user.role ?? UserRole.USER,
      password: Bun.password.hashSync(user.password ?? ''),
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return [true, {}];
  }

  public isAdmin() {
    return this.role === UserRole.ADMIN;
  }

  public getBucketPermissions(
    bucketId: number | undefined
  ): TUserBucketPermissions {
    if (!bucketId) {
      return {
        readPermission: false,
        writePermission: false,
        isOwner: false,
        managePermission: false
      };
    }

    const bucketPermission = BucketPermission.getUserPermissionByBucketId(
      this.id,
      bucketId
    );

    const isAdmin = this.isAdmin();
    const isUserOwner = isOwner(bucketPermission?.permission);
    const readPermission =
      hasReadPermission(bucketPermission?.permission) || isUserOwner || isAdmin;
    const writePermission =
      hasWritePermission(bucketPermission?.permission) ||
      isUserOwner ||
      isAdmin;
    const managePermission = isAdmin || isUserOwner;

    return {
      readPermission,
      writePermission,
      managePermission,
      isOwner: isUserOwner
    };
  }

  public updateLastSeen() {
    const query = db.query(
      'UPDATE users SET lastSeen = $lastSeen WHERE id = $id'
    );

    query.run({ lastSeen: Date.now(), id: this.id });
  }

  public delete() {
    const query = db.query('DELETE FROM users WHERE id = $id');

    query.run({ id: this.id });
  }

  public update(newData: Partial<User>): TCreateResponse<boolean> {
    const errors = validateObject(newData, ZedUser);

    if (errors) {
      return [false, errors];
    }

    const existingUser = User.findByName(newData.name ?? '');

    if (existingUser && existingUser.id !== this.id) {
      return [false, { name: 'Name already in use' }];
    }

    const query = db
      .query(
        `
      UPDATE users
      SET
        name = $name,
        email = $email,
        role = $role,
        password = $password,
        updatedAt = $updatedAt
      WHERE id = $id
    `
      )
      .as(User);

    query.run({
      id: this.id,
      name: newData.name ?? this.name,
      email: newData.email ?? this.email,
      role: newData.role ?? this.role,
      password: newData.password
        ? Bun.password.hashSync(newData.password)
        : this.password,
      updatedAt: Date.now()
    });

    return [true, {}];
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      lastSeen: this.lastSeen,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export { User };
