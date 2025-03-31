/// <reference types="vite/client" />

declare global {
  interface Window {
    API_HOST: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CDN_URL: string;
  readonly VITE_CDN_BUCKET: string;
  readonly VITE_UMAMI_ENDPOINT: string;
  readonly VITE_UMAMI_WEBSITE_ID: string;
  readonly VITE_UMAMI_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
