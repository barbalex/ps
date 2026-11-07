// Temporary spike config: the main config + unminified dep optimization so
// browser stack traces from leaflet/geoman are readable. Delete after the
// Leaflet 2 experiment.
import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config.ts'

export default mergeConfig(
  typeof base === 'function' ? base() : (base as never),
  defineConfig({
    optimizeDeps: {
      esbuildOptions: { minify: false },
    },
  }),
)
