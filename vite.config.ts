import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
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
    VitePWA({
      workbox: {
        sourcemap: true,
        globPatterns: [
          '**/*.{js,jsx,ts,tsx,css,html,ico,png,jpg,svg,webp,json,woff2,woff}',
        ],
        maximumFileSizeToCacheInBytes: 1000000000,
      },
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt'],
      manifest: {
        scope: '.',
        name: 'Arten fördern App',
        short_name: 'Arten fördern',
        start_url: '/data',
        // https://web.dev/add-manifest/:
        // Your start_url should direct the user straight into your app,
        // rather than a product landing page.
        // Think about what the user will want to do once they open your app,
        // and place them there
        display: 'standalone',
        background_color: '#265225e6',
        theme_color: '#265225e6',
        icons: [
          {
            src: '/icon_072.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon_144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon_192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon_1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        orientation: 'portrait',
        description:
          'Naturschutzfachleute fördern bedrohte Arten und Lebensräume',
      },
    }),
  ],
  envPrefix: ['VITE_', 'ELECTRIC_'],
  optimizeDeps: {
    exclude: ['@electric-sql/pglite', '@electric-sql/pglite-tools'],
  },
  build: {
    outDir: 'frontend/dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // advancedChunks (rolldown's native mechanism) instead of
        // manualChunks: manualChunks cannot capture vite's virtual
        // `\0vite/preload-helper.js` module, so __vitePreload landed inside
        // vendor-pglite and the entry statically imported the whole ~800KB
        // PGlite chunk — every page (home included) downloaded it before
        // mounting. The explicit helper group keeps it in its own tiny chunk.
        advancedChunks: {
          groups: [
            { name: 'vite-preload-helper', test: /vite\/preload-helper/ },
            {
              name: 'vendor-react-icons',
              test: /react-icons\//,
            },
            { name: 'vendor-fluent', test: /@fluentui\// },
            {
              name: 'vendor-intl',
              test: /react-intl|@formatjs\//,
            },
            {
              name: 'vendor-maps',
              test: /leaflet|react-leaflet|@react-leaflet|proj4|@turf\/|reproject/,
            },
            { name: 'vendor-charts', test: /recharts/ },
            { name: 'vendor-motion', test: /framer-motion/ },
            { name: 'vendor-pglite', test: /@electric-sql\// },
            {
              name: 'vendor-tanstack',
              test: /node_modules\/@tanstack\//,
            },
            {
              name: 'vendor-react',
              test: /node_modules\/(react|react-dom|react-is|react-error-boundary|react-transition-group)\//,
            },
          ],
        },
      },
    },
  },
  css: {
    modules: {
      // enable using named exports for css classes
      // https://vite.dev/guide/features.html#css-modules
      localsConvention: 'camelCaseOnly',
    },
  },
})
