import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import version from 'vite-plugin-package-version';
import webfontDownload from 'vite-plugin-webfont-dl';

export default defineConfig(() => {
  const isProduction = process.env.NODE_ENV === 'production';
  const buildTimePath = path.resolve(__dirname, './BUILD_TIME.txt');
  const buildTimeFileExists = fs.existsSync(buildTimePath);

  let buildTime = 0;

  if (buildTimeFileExists) {
    buildTime = parseInt(fs.readFileSync(buildTimePath, 'utf-8'));
  }

  return {
    base: isProduction ? '/_' : undefined,
    plugins: [react(), webfontDownload(), viteCompression(), version()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    define: {
      'import.meta.env.VITE_BUILD_TIME': buildTime
    }
  };
});
