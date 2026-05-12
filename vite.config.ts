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
  },
  css: {
    modules: {
      // enable using named exports for css classes
      // https://vite.dev/guide/features.html#css-modules
      localsConvention: 'camelCaseOnly',
    },
  },
})
