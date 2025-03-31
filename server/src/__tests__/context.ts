import type { TBucket, TBucketPermission, TUser } from '@perseusfs/shared';
import type { Server } from 'bun';
import { clearData, dropAllTables, loadDb } from '../database/db';
import { Bucket } from '../database/models/bucket';
import { BucketPermission } from '../database/models/bucket-permission';
import { File } from '../database/models/file';
import { User } from '../database/models/user';

class TestContext {
  public baseUrl!: string;
  public loginTokens: Record<number, string> = {};

  public async login(username: string, password: string) {
    const response = await fetch(`${this.baseUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const { token } = await response.json();

    if (!token) {
      throw new Error('Failed to login');
    }

    return token;
  }

  public ensureUser(userData: Partial<TUser>) {
    const user = User.findByName(userData.name!);

    if (user) {
      user.delete();
    }

    User.create(userData);

    const createdUser = User.findByName(userData.name!);

    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    return createdUser;
  }

  public ensureBucketPermission(permissionData: Partial<TBucketPermission>) {
    const bucketPermission = BucketPermission.findByUserIdAndBucketId(
      permissionData.bucketId!,
      permissionData.userId!
    );

    if (bucketPermission) {
      bucketPermission.delete();
    }

    BucketPermission.create({
      bucketId: permissionData.bucketId!,
      userId: permissionData.userId!,
      permission: permissionData.permission!
    });

    const createdBucketPermission = BucketPermission.findByUserIdAndBucketId(
      permissionData.bucketId!,
      permissionData.userId!
    );

    if (!createdBucketPermission) {
      throw new Error('Failed to create bucket permission');
    }

    return createdBucketPermission;
  }

  public ensureBucket(bucketData: Partial<TBucket>) {
    const bucket = Bucket.findByName(bucketData.name!);

    if (bucket) {
      bucket.delete();
    }

    Bucket.create(bucketData);

    const createdBucket = Bucket.findByName(bucketData.name!);

    if (!createdBucket) {
      throw new Error('Failed to create bucket');
    }

    return createdBucket;
  }

  public ensureFile(name: string, bucketId: number) {
    const file = File.findByBucketAndKey(bucketId, name);

    if (file) {
      file.delete();
    }

    File.writeFile(this.getStringAsArrayBuffer(100), bucketId, undefined, name);

    const createdFile = File.findByBucketAndKey(bucketId, name);

    if (!createdFile) {
      throw new Error('Failed to create file');
    }

    return createdFile;
  }

  public async init(server: Server) {
    this.baseUrl = `http://${server.hostname}:${server.port}`;
    this.loginTokens = {
      1: await this.login('admin', 'admin'),
      2: await this.login('user-2', 'password'),
      3: await this.login('user-3', 'password'),
      4: await this.login('user-4', 'password'),
      5: await this.login('user-5', 'password')
    };
  }

  public databaseToJson() {
    const users = User.findAll();
    const bucketPermissions = BucketPermission.findAll();
    const files = File.findAll();

    return {
      users: users.map((user) => user.toJSON()),
      bucketPermissions: bucketPermissions.map((bucketPermission) =>
        bucketPermission.toJSON()
      ),
      files: files.map((file) => file.toJSON())
    };
  }

  public getStringAsArrayBuffer(length: number): ArrayBuffer {
    const arrayBuffer = new ArrayBuffer(length);
    const view = new Uint8Array(arrayBuffer);

    for (let i = 0; i < length; i++) {
      view[i] = 0; // Fill with null characters (char code 0)
    }

    return arrayBuffer;
  }

  public resetDatabase() {
    clearData(); // deletes the buckets directory
    dropAllTables();
    loadDb();
  }
}

const context = new TestContext();

export { context as TestContext };
