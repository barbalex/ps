/// <reference types="vite/client" />

// Extend Window interface for development debugging
interface Window {
  __pglite_db__?: import('@electric-sql/pglite').PGlite
  __jotai_store__?: import('jotai').createStore
}
