import { expect, test } from 'bun:test';
import fs from 'fs';
import { TestContext } from '../../../__tests__/context';
import { Bucket } from '../bucket';
import { File } from '../file';

const getRandomMockFile = () => {
  return TestContext.getStringAsArrayBuffer(Math.random() + 100 * 5000);
};

test('Writes file and adds it to the database', () => {
  const mock = getRandomMockFile();
  const { currentPath, fileId, fileName } = File.writeFile(
    mock,
    4,
    1,
    'test.txt'
  );

  const parts = currentPath.split('/');

  expect(fileName).toBe('test.txt');
  expect(fileId).toBeGreaterThan(0);
  expect(parts[0]).toBe('bucket-4');
  expect(parts[1]).toBe('test.txt');

  const filePath = Bucket.getPath(currentPath);

  expect(fs.existsSync(filePath)).toBe(true);
  expect(fs.statSync(filePath).size).toBe(mock.byteLength);

  const dbFile = File.findById(fileId);

  expect(dbFile).toBeDefined();
  expect(dbFile?.id).toBe(fileId);
  expect(dbFile?.name).toBe(fileName);
  expect(dbFile?.size).toBe(mock.byteLength);
  expect(dbFile?._user).toBeDefined();
});

test('Do not collide file names in the same bucket', () => {
  for (let i = 0; i < 20; i++) {
    const mock = TestContext.getStringAsArrayBuffer(Math.random() * 5000);
    const { fileName, fileId, currentPath } = File.writeFile(
      mock,
      4,
      1,
      'my-file.bin'
    );

    const targetName = i === 0 ? 'my-file.bin' : `my-file-${i}.bin`;
    const parts = currentPath.split('/');

    expect(fileName).toBe(targetName);
    expect(fileId).toBeGreaterThan(0);
    expect(parts[0]).toBe('bucket-4');
    expect(parts[1]).toBe(targetName);

    const filePath = Bucket.getPath(currentPath);

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.statSync(filePath).size).toBe(mock.byteLength);

    const dbFile = File.findById(fileId);

    expect(dbFile).toBeDefined();
    expect(dbFile?.id).toBe(fileId);
    expect(dbFile?.name).toBe(fileName);
    expect(dbFile?.size).toBe(mock.byteLength);
  }
});

test('Writes two files with the same name for different buckets (no name collisions)', () => {
  const mock = getRandomMockFile();

  const {
    currentPath: firstCurrentPath,
    fileId: firstFileId,
    fileName: firstFileName
  } = File.writeFile(mock, 4, 1, 'samefile.data');

  const {
    currentPath: secondCurrentPath,
    fileId: secondFileId,
    fileName: secondFileName
  } = File.writeFile(mock, 5, 1, 'samefile.data');

  expect(firstCurrentPath).toBeDefined();
  expect(firstFileId).toBeGreaterThan(0);
  expect(secondCurrentPath).toBeDefined();
  expect(secondFileId).toBeGreaterThan(0);
  expect(firstFileName).toBe(secondFileName);

  const firstFilePath = Bucket.getPath(firstCurrentPath);
  const secondFilePath = Bucket.getPath(secondCurrentPath);

  expect(fs.existsSync(firstFilePath)).toBe(true);
  expect(fs.existsSync(secondFilePath)).toBe(true);
});

test('Writes two files with the same name for different buckets (no name collisions)', () => {
  const mock = getRandomMockFile();

  const {
    currentPath: firstCurrentPath,
    fileId: firstFileId,
    fileName: firstFileName
  } = File.writeFile(mock, 4, 1, 'samefile.data');

  const {
    currentPath: secondCurrentPath,
    fileId: secondFileId,
    fileName: secondFileName
  } = File.writeFile(mock, 5, 1, 'samefile.data');

  expect(firstCurrentPath).toBeDefined();
  expect(firstFileId).toBeGreaterThan(0);
  expect(secondCurrentPath).toBeDefined();
  expect(secondFileId).toBeGreaterThan(0);
  expect(firstFileName).toBe(secondFileName);
});

test('Do not write files for non existing bucket', () => {
  const mock = getRandomMockFile();

  try {
    File.writeFile(mock, 9999, 1, 'test.txt');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});

test('Writes file with no extension', () => {
  const mock = getRandomMockFile();
  const { currentPath, fileId, fileName } = File.writeFile(mock, 4, 1, 'damn');

  const parts = currentPath.split('/');

  expect(fileName).toBe('damn');
  expect(fileId).toBeGreaterThan(0);
  expect(parts[0]).toBe('bucket-4');
  expect(parts[1]).toBe('damn');

  const filePath = Bucket.getPath(currentPath);

  expect(fs.existsSync(filePath)).toBe(true);
  expect(fs.statSync(filePath).size).toBe(mock.byteLength);

  const dbFile = File.findById(fileId);

  expect(dbFile).toBeDefined();
  expect(dbFile?.id).toBe(fileId);
  expect(dbFile?.name).toBe(fileName);
  expect(dbFile?.size).toBe(mock.byteLength);
});

test('Do not write invalid filename', () => {
  const mock = getRandomMockFile();

  try {
    File.writeFile(mock, 9999, 1, '..');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
  }
});

test('Write file with no owner', () => {
  const mock = getRandomMockFile();

  const { fileId } = File.writeFile(mock, 4, undefined, 'test.txt');
  const dbFile = File.findById(fileId);

  expect(dbFile).toBeDefined();
  expect(dbFile?.id).toBe(fileId);
  expect(dbFile?._user).toBeNull();
});

test('Delete file', () => {
  const mock = getRandomMockFile();
  const { fileId, currentPath } = File.writeFile(mock, 4, 1, 'test.txt');
  const dbFile = File.findById(fileId);

  expect(dbFile).toBeDefined();
  expect(dbFile?.id).toBe(fileId);

  const filePath = Bucket.getPath(currentPath);

  expect(fs.existsSync(filePath)).toBe(true);

  dbFile?.delete();

  expect(fs.existsSync(filePath)).toBe(false);

  const newDbFile = File.findById(fileId);

  expect(newDbFile).toBeNull();
});
