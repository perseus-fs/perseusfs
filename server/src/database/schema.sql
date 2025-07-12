CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE DEFAULT NULL,
    role TEXT NOT NULL DEFAULT '${UserRole.USER}',
    password TEXT NOT NULL,
    lastSeen INTEGER DEFAULT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

CREATE TABLE buckets (
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
    extraHeaders TEXT DEFAULT '{}',
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

CREATE TABLE bucket_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bucketId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    permission TEXT NOT NULL CHECK (
        permission IN ('owner', 'read', 'write', 'read-write')
    ),
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (bucketId) REFERENCES buckets(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (bucketId, userId)
);

CREATE TABLE files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bucketId INTEGER NOT NULL,
    name TEXT NOT NULL,
    originalName TEXT NOT NULL,
    path TEXT,
    size INTEGER NOT NULL,
    contentType TEXT NOT NULL,
    uploadedBy INTEGER,
    hash TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (bucketId) REFERENCES buckets(id) ON DELETE CASCADE,
    FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (bucketId, name)
);

CREATE TABLE migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version NUMBER NOT NULL,
    executedAt INTEGER NOT NULL,
    error TEXT
);

CREATE TABLE request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT NOT NULL,
    address TEXT NOT NULL,
    host TEXT,
    path TEXT NOT NULL,
    status INTEGER NOT NULL,
    time FLOAT NOT NULL,
    country TEXT,
    createdAt INTEGER NOT NULL
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE statics (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
