import fs from "fs";
import path from "path";
import { parseArgs } from "util";
import {
  compile,
  execAsync,
  patchPackageJsonVersion,
  patchReadMe,
} from "./helpers";
import semver from "semver";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    bump: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

if (!!values.bump) {
  if (!["major", "minor", "patch"].includes(values.bump)) {
    console.error("Invalid bump type");
    process.exit(1);
  }

  const rootPackageJson = path.join(process.cwd(), "package.json");
  const interfacePackageJson = path.join(process.cwd(), "app", "package.json");
  const serverPackageJson = path.join(process.cwd(), "server", "package.json");
  const sharedPackageJson = path.join(process.cwd(), "shared", "package.json");
  const packageJsonStr = fs.readFileSync(rootPackageJson, "utf-8");
  const packageJson = JSON.parse(packageJsonStr);

  const newVersion = semver.inc(
    packageJson.version,
    values.bump as semver.ReleaseType
  );

  if (!newVersion) {
    console.error("Invalid version bump");
    process.exit(1);
  }

  console.log(
    `Bumping version from ${packageJson.version} to ${newVersion} (type: ${values.bump})`
  );

  const promises = [
    rootPackageJson,
    interfacePackageJson,
    serverPackageJson,
    sharedPackageJson,
  ].map(async (packageJsonPath) => {
    await patchPackageJsonVersion(packageJsonPath, newVersion);
  });

  await Promise.all(promises);
}

await patchReadMe();

const DEV_BUILD_INFO = {
  buildTime: 0,
  version: "dev",
  env: "development",
};

const start = performance.now();

const interfacePath = path.join(process.cwd(), "app");
const serverPath = path.join(process.cwd(), "server");
const buildArtifactPath = path.join(interfacePath, "dist");
const buildInfoPath = path.join(serverPath, "src", "build.json");
const exportsPath = path.join(serverPath, "exports");
const serverBuildPath = path.join(serverPath, "build");
const targetInterfacePath = path.join(serverBuildPath, "interface");

// clean all old build artifacts
fs.rmSync(serverBuildPath, { recursive: true, force: true });
fs.rmSync(exportsPath, { recursive: true, force: true });

console.log("Building interface...");

await execAsync(["bun", "--bun", "run", "build"], { cwd: interfacePath });

console.log("Interface built successfully!");

if (!fs.existsSync(buildArtifactPath)) {
  throw new Error("Build artifact not found");
}

if (!fs.existsSync(targetInterfacePath)) {
  fs.mkdirSync(targetInterfacePath, { recursive: true });
}

if (!fs.existsSync(exportsPath)) {
  fs.mkdirSync(exportsPath, { recursive: true });
}

console.log("Copying build artifacts to server...");

fs.cpSync(buildArtifactPath, targetInterfacePath, { recursive: true });

console.log("Build artifacts copied successfully!");

console.log("Renaming index.html to index-og.html...");

const indexPath = path.join(targetInterfacePath, "index.html");
const ogIndexPath = path.join(targetInterfacePath, "index-og.html");

fs.renameSync(indexPath, ogIndexPath);

const packageJsonPath = path.join(serverPath, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

console.log("Writing build time...");

const buildInfo = {
  buildTime: Date.now(),
  version: packageJson.version,
  env: "production",
};

fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));

console.log("Build time written successfully!");
console.log("Building server...", serverPath);

const buildTargets = [
  {
    target: "bun-linux-x64-modern",
    zipName: "linux-x64.zip",
  },
  {
    target: "bun-linux-arm64-modern",
    zipName: "linux-arm64.zip",
  },
  {
    target: "bun-darwin-x64-modern",
    zipName: "macos-x64.zip",
  },
  {
    target: "bun-darwin-arm64-modern",
    zipName: "macos-arm64.zip",
  },
  {
    target: "bun-windows-x64-modern",
    zipName: "windows-x64.zip",
  },
];

for (const { target, zipName } of buildTargets) {
  console.log(`Building for ${target}...`);

  await compile(serverPath, exportsPath, target, zipName);

  console.log(`Build for ${target} completed successfully!`);
}

console.log("Cleaning up...");

fs.writeFileSync(buildInfoPath, JSON.stringify(DEV_BUILD_INFO, null, 2));

const end = performance.now();

console.log(`Build completed in ${end - start}ms`);
