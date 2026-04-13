/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ADMIN_EMAILS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend Window interface for development debugging
interface Window {
  __pglite_db__?: import('@electric-sql/pglite').PGlite
  __jotai_store__?: import('jotai').createStore
}
