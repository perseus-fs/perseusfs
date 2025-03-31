import { spawn } from "bun";
import fs from "fs";
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
  const packageJsonStr = fs.readFileSync(path, "utf-8");
  const packageJson = JSON.parse(packageJsonStr);

  packageJson.version = version;

  fs.writeFileSync(path, JSON.stringify(packageJson, null, 2));
};

const cleanBuildFolder = (targetPath: string) => {
  fs.readdirSync(targetPath).forEach((file) => {
    const filePath = path.join(targetPath, file);

    if (fs.statSync(filePath).isFile() && !filePath.endsWith(".gitkeep")) {
      fs.unlinkSync(filePath);
    }
  });
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

  cleanBuildFolder(buildPath);

  console.log(`Compiling server for ${target}...`);

  await execAsync(
    [
      "bun",
      "build",
      "--compile",
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

export { execAsync, patchPackageJsonVersion, compile };
