import chalk from 'chalk';
import { File } from '../database/models/file';

const filesCleaner = () => {
  const disposableFiles = File.findDisposableFiles();

  if (!disposableFiles.length) {
    return;
  }

  disposableFiles.forEach((file) => {
    file.delete();
  });

  console.log(
    `${chalk.blue('Cron:')} Deleted ${disposableFiles.length} disposable files`
  );
};

export { filesCleaner };
