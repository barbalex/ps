/// <reference types="vite/client" />

// injected at build time (vite.config.ts define) from package.json version
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_APP_ADMIN_EMAILS?: string
  readonly VITE_ERROR_TELEMETRY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend Window interface for development debugging
interface Window {
  __pglite_db__?: import('@electric-sql/pglite').PGlite
  __jotai_store__?: import('jotai').createStore
}
