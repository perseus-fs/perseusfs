import * as migration1 from './1-mock';
import * as migration2 from './2-add-bucket-headers';

const list = [
  {
    version: 1,
    name: 'mock',
    ref: migration1
  },
  {
    version: 2,
    name: 'add-bucket-headers',
    ref: migration2
  }
];

// sort to be extra sure the last migration in the list is the most recent one
export const migrationsList = list.sort((a, b) => {
  if (a.version < b.version) return -1;
  if (a.version > b.version) return 1;

  return 0;
});

// this file is a workaround for bun not being able to correctly bundle files as of now
// when bundling is fixed, this file will be removed and the migrations will be read directly from memory

// in here, name should match the filename of the migration
// and the version should be the version of the migration to avoid confusion later
// <version>-<name>.ts
