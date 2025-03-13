import React, { createRef } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { FluentProvider } from '@fluentui/react-components'
import { Provider as JotaiProvider } from 'jotai'
import { PGlite } from '@electric-sql/pglite'
import { live } from '@electric-sql/pglite/live'
import { PGliteProvider } from '@electric-sql/pglite-react'

// TODO: is this really needed?
import * as UC from '@uploadcare/file-uploader'
UC.defineComponents(UC)

import { styleSheet } from './css.ts'
import 'allotment/dist/style.css'
import './style.css'

import { lightTheme } from './modules/theme.ts'
// import { router } from './router/index.tsx'
import { UploaderContext } from './UploaderContext.ts'
import { store } from './store.ts'

import { routeTree } from './routeTree.gen'
const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const db = await PGlite.create('idb://ps', {
  extensions: { live },
  relaxedDurability: true,
  // debug: true,
})

const routerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100dvh',
}

export const App = () => {
  // console.log('App, theme:', customLightTheme)
  const uploaderRef = createRef<HTMLElement | null>(null)

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
          <style dangerouslySetInnerHTML={{ __html: styleSheet() }} />
          <div
            style={routerContainerStyle}
            id="router-container"
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
