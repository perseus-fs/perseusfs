import { spawn } from "bun";
import fs from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";

const execAsync = async (command: string[], options?: {}): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const process = spawn(command, {
      ...options,
      stdin: "inherit",
      stdout: "inherit",
    });

    console.log(`Executing "${command.join(" ")}"`);

    const exitCode = await process.exited;

    if (exitCode === 0) {
      resolve();
    } else {
      reject("Process exited with code " + exitCode);
    }
  });
};

const patchPackageJsonVersion = async (path: string, version: string) => {
  const packageJsonStr = await fs.readFile(path, "utf-8");
  const packageJson = JSON.parse(packageJsonStr);

  packageJson.version = version;

  await fs.writeFile(path, JSON.stringify(packageJson, null, 2));
};

const patchReadMe = async () => {
  const filePath = path.resolve(process.cwd(), "README.md");
  const readme = await fs.readFile(filePath, "utf-8");
  const bunVersion = await getBunVersion();

  const updated = readme.replace(
    /(<img\s+src="https:\/\/img\.shields\.io\/badge\/Bun-)(\d+\.\d+\.\d+)(-orange")/,
    `$1${bunVersion}$3`
  );

  if (updated === readme) {
    console.log("No changes made to README.md (badge already up to date).");
    return;
  }

  await fs.writeFile(filePath, updated, "utf-8");
  console.log(`README.md updated with Bun version ${bunVersion}`);
};

const cleanBuildFolder = async (targetPath: string) => {
  const files = await fs.readdir(targetPath);

  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(targetPath, file);

      if (
        (await fs.stat(filePath)).isFile() &&
        !filePath.endsWith(".gitkeep")
      ) {
        await fs.unlink(filePath);
      }
    })
  );
};

const compile = async (
  serverPath: string,
  exportsPath: string,
  target: string,
  zipName: string
) => {
  const start = performance.now();

  const buildPath = path.join(serverPath, "build");
  const zipPath = path.join(exportsPath, zipName);

  await cleanBuildFolder(buildPath);

  console.log(`Compiling server for ${target}...`);

  await execAsync(
    [
      "bun",
      "build",
      "--compile",
      "--minify",
      `--target=${target}`,
      "--outfile",
      "./build/perseusfs",
      "./src/app.ts",
      "./src/build.json",
    ],
    { cwd: serverPath }
  );

  console.log(`Zipping server for ${target}...`);

  const zip = new AdmZip();

  zip.addLocalFolder(buildPath);
  zip.writeZip(zipPath);

  console.log(`Done for ${target} in ${performance.now() - start}ms`);

  return zipPath;
};

const getBunVersion = () => {
  const bunVersion = process.versions.bun;

  if (!bunVersion) {
    throw new Error(
      "Bun is not installed or not available in the environment."
    );
  }

  return bunVersion;
};

export { execAsync, patchPackageJsonVersion, compile, patchReadMe };
