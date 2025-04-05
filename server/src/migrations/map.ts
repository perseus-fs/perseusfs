import * as migration1 from './1-welcome_to_perseusfs';

export const migrationsList = [
  {
    version: 1,
    name: 'welcome_to_perseusfs',
    ref: migration1
  }
];

// this file is a workaround for bun not being able to correctly bundle files as of now
// when bundling is fixed, this file will be removed and the migrations will be read directly from memory

// in here, name should match the filename of the migration
// and the version should be the version of the migration to avoid confusion later
// <version>-<name>.ts
