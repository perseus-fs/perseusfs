/**
 * This migration adds a new column `extraHeaders` to the `buckets` table.
 * The column is of type `jsonb` and has a default value of an empty object.
 */

import { db } from '../database/db';

const up = async () => {
  db.exec(`
    ALTER TABLE buckets
    ADD COLUMN extraHeaders jsonb DEFAULT '{}';
  `);
};

export { up };
