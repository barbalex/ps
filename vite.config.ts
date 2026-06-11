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
  define: {
    'process.env': {},
  },
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
        manualChunks: (id) => {
          if (id.includes('react-icons/')) return 'vendor-react-icons'
          if (id.includes('@fluentui/')) return 'vendor-fluent'
          if (id.includes('react-intl') || id.includes('@formatjs/'))
            return 'vendor-intl'
          if (
            id.includes('leaflet') ||
            id.includes('react-leaflet') ||
            id.includes('@react-leaflet') ||
            id.includes('proj4') ||
            id.includes('@turf/') ||
            id.includes('reproject')
          )
            return 'vendor-maps'
          if (id.includes('recharts')) return 'vendor-charts'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('@electric-sql/')) return 'vendor-pglite'
          if (id.includes('node_modules/@tanstack/')) return 'vendor-tanstack'
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-is/') ||
            id.includes('node_modules/react-error-boundary/') ||
            id.includes('node_modules/react-transition-group/')
          )
            return 'vendor-react'
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
