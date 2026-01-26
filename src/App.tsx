import { createRef, lazy } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { FluentProvider } from '@fluentui/react-components'
import { Provider as JotaiProvider } from 'jotai'
import { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { live } from '@electric-sql/pglite/live'
import { PGliteProvider } from '@electric-sql/pglite-react'
import { useBeforeunload } from 'react-beforeunload'

// TODO: is this really needed?
import * as UC from '@uploadcare/file-uploader'
UC.defineComponents(UC)

import './style.css'
import styles from './App.module.css'

import { lightTheme } from './modules/theme.ts'
// import { router } from './router/index.tsx'
import { UploaderContext } from './UploaderContext.ts'
import { store, pgliteDbAtom } from './store.ts'

import { routeTree } from './routeTree.gen'
const RouterErrorBoundary = lazy(async () => ({
  default: (await import('./components/shared/RouterErrorBoundary.tsx'))
    .RouterErrorBoundary,
}))
// TODO: add defaultErrorComponent
// https://tanstack.com/start/latest/docs/framework/react/guide/error-boundaries
const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error }) => <RouterErrorBoundary error={error} />,
})
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const db = await PGlite.create('idb://ps', {
  extensions: {
    live,
    electric: electricSync(),
  },
  relaxedDurability: true,
  // debug: true,
})
store.set(pgliteDbAtom, db)

export const App = () => {
  const uploaderRef = createRef<HTMLElement | null>(null)

  // needed to prevent problems with relaxed durability and closing connections
  // https://github.com/electric-sql/pglite/issues/879#issuecomment-3777577150
  useBeforeunload(() => db.close())

  return (
    <PGliteProvider db={db}>
      <JotaiProvider store={store}>
        <FluentProvider theme={lightTheme}>
          <uc-config
            ctx-name="uploadcare-uploader"
            pubkey="db67c21b6d9964e195b8"
            maxLocalFileSizeBytes="100000000"
            multiple="false"
            sourceList="local, camera, dropbox, gdrive, gphotos"
            useCloudImageEditor="true"
          ></uc-config>
          <uc-upload-ctx-provider
            id="uploaderctx"
            ctx-name="uploadcare-uploader"
            ref={uploaderRef}
          ></uc-upload-ctx-provider>
          <div
            id="router-container"
            className={styles.routerContainer}
          >
            <UploaderContext.Provider value={uploaderRef}>
              <RouterProvider router={router} />
            </UploaderContext.Provider>
          </div>
        </FluentProvider>
      </JotaiProvider>
    </PGliteProvider>
  )
}
