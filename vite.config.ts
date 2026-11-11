import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import formatjs from '@formatjs/vite-plugin'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import babel from '@rolldown/plugin-babel'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5176,
    // Fail loudly instead of drifting to 5177+: the auth server's CORS
    // allowlist only trusts localhost:5176, so a drifted port breaks login.
    strictPort: true,
    // host: '0.0.0.0',
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routeFileIgnorePrefix: '-',
    }),
    react(),
    // React Compiler only for builds: the babel pass is the heaviest
    // per-module transform and saturates the dev pipeline on full-graph
    // reloads (module requests then hang forever).
    ...(process.env.NODE_ENV === 'production' ?
      [babel({ presets: [reactCompilerPreset()] })]
    : []),
    formatjs({
      idInterpolationPattern: '[sha512:contenthash:base64:6]',
      ast: true,
    }),
    svgr(),
    // the version-check banner (src/components/VersionCheck) fetches
    // /version.json to compare the deployed version against the running
    // bundle. The file must never be cached — neither by the service
    // worker (globIgnores in the workbox options below) nor by Netlify
    // (headers in netlify.toml).
    {
      name: 'emit-version-json',
      apply: 'build',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({
            version: pkg.version,
            versionDate: pkg.versionDate,
          }),
        })
      },
    },
    VitePWA({
      workbox: {
        sourcemap: true,
        // avif included: the hero images are the LCP element and must come
        // from the precache on repeat visits, not from a revalidating fetch
        globPatterns: [
          '**/*.{js,jsx,ts,tsx,css,html,ico,png,jpg,svg,webp,avif,json,woff2,woff}',
        ],
        // version.json must always come from the network (see
        // emit-version-json above)
        globIgnores: ['version.json'],
        // On arten-fördern.ch the OAuth callback is a same-origin navigation
        // to /auth/callback/google that the Netlify edge function must proxy
        // to the auth server — without the denylist the navigation fallback
        // serves the precached SPA shell instead, the authorization code never
        // reaches the backend and the router shows its 404 page. '/auth'
        // itself (the SPA login page, no trailing slash) keeps the fallback.
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/auth\//],
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
            // es-toolkit pinned in its own tiny chunk. it must be claimed
            // before groups whose packages depend on it: advancedChunks
            // groups capture matched modules' dependencies recursively,
            // which otherwise drags shared deps into big vendor chunks
            { name: 'vendor-es-toolkit', test: /node_modules\/es-toolkit\// },
            // vendor-react claims react/react-dom before the lazy vendor
            // groups below: groups capture dependencies recursively, so a
            // later react group loses react-dom modules to earlier groups
            // (react-leaflet's dependency dragged react-dom into vendor-maps)
            {
              name: 'vendor-react',
              test: /node_modules\/(react|react-dom|react-is|react-error-boundary|react-transition-group)\//,
            },
            // no react-icons group: a single chunk holding every icon in the
            // app loads eagerly as soon as the app shell needs one icon.
            // without the group, icons bundle with the components using them
            // no vendor-fluent group either, for the same reason: it merged
            // every fluent package used anywhere (carousel, tree, table,
            // datepicker, ...) into one chunk the app shell loads eagerly.
            // fluent modules now bundle with the components using them; the
            // shell's fluent core lands in shared eager chunks
            {
              name: 'vendor-intl',
              test: /react-intl|@formatjs\//,
            },
            {
              name: 'vendor-maps',
              test: /leaflet|react-leaflet|@react-leaflet|proj4|@turf\/|reproject/,
            },
            // no vendor-charts group: capturing recharts captures its
            // dependencies recursively (es-toolkit, redux), and es-toolkit is
            // imported app-wide — that made the whole recharts chunk a static
            // dependency of the app shell. without the group, recharts lands
            // in shared chunks that load with the chart pages
            { name: 'vendor-motion', test: /framer-motion/ },
            { name: 'vendor-pglite', test: /@electric-sql\// },
            {
              name: 'vendor-tanstack',
              test: /node_modules\/@tanstack\//,
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
