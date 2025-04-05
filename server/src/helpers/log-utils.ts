import { SettingKey } from '@perseusfs/shared';
import chalk from 'chalk';
import fs from 'fs';
import { db } from '../database/db';
import { Migration } from '../database/models/migration';
import { Settings } from '../database/models/settings';
import { getLocalIPAddress } from './get-local-ip';

const logLogo = () => {
  console.log(
    chalk.yellowBright(` ######                                            #######  #####  
   #     # ###### #####   ####  ###### #    #  ####  #       #     # 
   #     # #      #    # #      #      #    # #      #       #       
   ######  #####  #    #  ####  #####  #    #  ####  #####    #####  
   #       #      #####       # #      #    #      # #             # 
   #       #      #   #  #    # #      #    # #    # #       #     # 
   #       ###### #    #  ####  ######  ####   ####  #        #####  
                                                                     `)
  );
  console.log(`${chalk.green('Version:')} ${Settings.buildInfo.version}`);
};

const logDebug = () => {
  const dbStats = fs.statSync(db.filename).size / 1024 / 1024; // in MB

  console.log(
    chalk.bgBlue('==================================================')
  );
  console.log(`${chalk.cyan('Debug Mode:')} ${chalk.white('Enabled')}`);
  console.log(`${chalk.cyan('Hostname:')} ${chalk.white(Settings.hostname)}`);
  console.log(`${chalk.cyan('Domain:')} ${chalk.white(Settings.domain)}`);
  console.log(`${chalk.cyan('Port:')} ${chalk.white(Settings.port)}`);
  console.log(`${chalk.cyan('Local IP:')} ${chalk.white(getLocalIPAddress())}`);
  console.log(
    `${chalk.cyan('PerseusFS:')} ${chalk.white(Settings.buildInfo.version)}`
  );
  console.log(
    `${chalk.cyan('Max Request Size:')} ${chalk.white(Settings.get(SettingKey.MAX_REQUEST_SIZE))}`
  );
  console.log(
    `${chalk.cyan('CORS Allow Origin:')} ${chalk.white(Settings.get(SettingKey.CORS_ALLOW_ORIGIN))}`
  );
  console.log(
    `${chalk.cyan('Extra Headers:')} ${chalk.white(JSON.stringify(Settings.get(SettingKey.EXTRA_HEADERS)))}`
  );
  console.log(
    `${chalk.cyan('Environment:')} ${chalk.white(Settings.buildInfo.env)}`
  );
  console.log(`${chalk.cyan('Bun version:')} ${chalk.white(Bun.version)}`);
  console.log(
    `${chalk.cyan('Build Time:')} ${chalk.white(new Date(Settings.buildInfo.date).toLocaleString())}`
  );
  console.log(
    `${chalk.cyan('Database:')} ${chalk.white(db.filename)} (${chalk.white(dbStats.toFixed(2))} MB)`
  );
  console.log(
    `${chalk.cyan('Database version:')} ${chalk.white(Migration.getLastVersion())}`
  );
  console.log(
    `${chalk.cyan('Env vars:')} ${chalk.white(JSON.stringify(Settings.getFromEnv(), null, 2))}`
  );
  console.log(
    `${chalk.cyan('Args:')} ${chalk.white(JSON.stringify(Settings.getFromArgs(), null, 2))}`
  );
  console.log(
    chalk.bgBlue('==================================================')
  );
};

export { logDebug, logLogo };
