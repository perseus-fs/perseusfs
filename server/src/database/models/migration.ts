import { pathToFileURL } from 'bun';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { db } from '../db';

const MIGRATIONS_PATH = path.join(process.cwd(), 'src/migrations');

class Migration {
  public id!: number;
  public name!: string;
  public version!: number;
  public executedAt!: number;
  public error!: string | null;

  public static createTable() {
    db.exec(`
      CREATE TABLE migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          version NUMBER NOT NULL,
          executedAt INTEGER NOT NULL,
          error TEXT
      );
    `);
  }

  public static dropTable() {
    db.exec('DROP TABLE IF EXISTS migrations');
  }

  private static getAvailableMigrations() {
    const migrationFiles = fs
      .readdirSync(MIGRATIONS_PATH)
      .filter((file) => file.endsWith('.ts'));

    return migrationFiles
      .map((file) => {
        const parts = file.split('-');
        const version = parseInt(parts[0], 10);
        const name = parts.slice(1).join('-').replace('.ts', '');
        const filePath = path.join(MIGRATIONS_PATH, file);

        if (isNaN(version)) {
          console.log(chalk.red(`Invalid migration file name: ${file}`));
          process.exit(1);
        }

        return {
          version,
          name,
          filePath
        };
      })
      .sort((a, b) => a.version - b.version);
  }

  static findAll() {
    const query = db.query('SELECT * FROM migrations').as(Migration);

    return query.all();
  }

  static findByVersion(version: number) {
    const query = db
      .query('SELECT * FROM migrations WHERE version = $version')
      .as(Migration);

    return query.get({ version });
  }

  static create(migration: Partial<Migration>) {
    const query = db
      .query(
        'INSERT INTO migrations (name, version, executedAt, error) VALUES ($name, $version, $executedAt, $error)'
      )
      .as(Migration);

    query.run({
      name: migration.name ?? '',
      version: migration.version ?? 0,
      executedAt: Date.now(),
      error: migration.error ?? null
    });
  }

  static getLastVersion() {
    const query = db.query(
      'SELECT MAX(version) as version FROM migrations WHERE error IS NULL LIMIT 1'
    );
    const result = query.get() as { version: number | null };

    return result.version || 0;
  }

  public static printMigrations() {
    const availableMigrations = this.getAvailableMigrations();
    const migrations = this.findAll();

    console.log(
      `There are ${chalk.blue(availableMigrations.length)} migrations in the file system.`
    );

    for (const availableMigration of availableMigrations) {
      console.log(
        `  ${chalk.blue(availableMigration.name)} (${availableMigration.version})`
      );
    }

    console.log(
      `There are ${chalk.blue(migrations.length)} migration records in the database.`
    );

    for (const migration of migrations) {
      if (!migration.error) {
        console.log(
          `  ${chalk.blue(migration.name)} (${migration.version}) - ${chalk.green(
            'success'
          )} at ${new Date(migration.executedAt).toLocaleString()}`
        );
      } else {
        console.log(
          `  ${chalk.blue(migration.name)} (${migration.version}) - ${chalk.red(
            'failed'
          )} at ${new Date(migration.executedAt).toLocaleString()}`
        );
        console.log(`    Error: ${migration.error}`);
      }
    }
  }

  public static async runMigrations() {
    const availableMigrations = this.getAvailableMigrations();
    const lastVersion = this.getLastVersion();
    const newMigrations = availableMigrations.filter(
      (migration) => migration.version > lastVersion
    );

    if (newMigrations.length === 0) {
      return;
    }

    console.log(
      `Detected ${chalk.blue(newMigrations.length)} new migration(s) to run`
    );

    for (const migration of newMigrations) {
      const { version, name, filePath } = migration;
      const { href } = pathToFileURL(filePath);
      const { up } = await import(href);

      if (!up) {
        console.log(
          chalk.red(`Migration ${name} is invalid: no up function found`)
        );
        process.exit(1);
      }

      db.exec('BEGIN');

      try {
        console.log(`Running migration ${chalk.blue(name)}...`);

        await up();

        this.create({
          name,
          version
        });

        db.exec('COMMIT');

        console.log(
          `Migration ${chalk.blue(name)} executed successfully. DB is now in version ${chalk.blue(
            version
          )}.`
        );
      } catch (error) {
        db.exec('ROLLBACK');

        const errorMessage = error?.toString?.() || 'Unknown error';

        this.create({
          name,
          version,
          error: errorMessage
        });

        console.log(chalk.red('Migration failed:'), errorMessage);
        process.exit(1);
      }
    }
  }
}

export { Migration };
