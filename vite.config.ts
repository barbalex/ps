import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import formatjs from '@formatjs/vite-plugin'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import babel from '@rolldown/plugin-babel'
// import { tanstackStart } from '@tanstack/react-start/plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5176,
    // host: '0.0.0.0',
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    // enabling start causes error: https://github.com/TanStack/router/issues/5795#issuecomment-3973127942
    // tanstackStart(),
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routeFileIgnorePrefix: '-',
    }),
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    formatjs({
      idInterpolationPattern: '[sha512:contenthash:base64:6]',
      ast: true,
    }),
    svgr(),
  ],
  envPrefix: ['VITE_', 'ELECTRIC_'],
  optimizeDeps: {
    exclude: ['@electric-sql/pglite', '@electric-sql/pglite-tools'],
  },
  build: {
    outDir: 'frontend/dist',
    emptyOutDir: true,
  },
  css: {
    modules: {
      // enable using named exports for css classes
      // https://vite.dev/guide/features.html#css-modules
      localsConvention: 'camelCaseOnly',
    },
  },
})
