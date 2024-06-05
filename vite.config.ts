import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  // it seems that excluding pglite is necessary: https://github.com/electric-sql/pglite/issues/96#issuecomment-2148507357
  // also, maybe the headers are too: https://github.com/sqlite/sqlite-wasm?tab=readme-ov-file#usage-with-vite
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  plugins: [react(), svgr()],
  envPrefix: 'ELECTRIC_',
})
