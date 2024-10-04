import React, { createRef } from 'react'
import { RouterProvider } from 'react-router-dom'
import { FluentProvider } from '@fluentui/react-components'
import { Provider as JotaiProvider } from 'jotai'

// TODO: is this really needed?
import * as UC from '@uploadcare/file-uploader'
UC.defineComponents(UC)
// TODO: remove previous version of uploader
// import * as LR from '@uploadcare/blocks'
// UC.FileUploaderRegular.shadowStyles = /* CSS */ `
//   :host lr-copyright {
//     display: none;
//   }
//   :host lr-simple-btn {
//     display: none;
//   }
// `
// LR.registerBlocks(LR)

import { styleSheet } from './css.ts'
import 'allotment/dist/style.css'
import './style.css'

import { lightTheme } from './modules/theme.ts'
import { router } from './router/index.tsx'
import { UploaderContext } from './UploaderContext.ts'
import { store } from './store.ts'

const routerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100dvh',
}

export default function App() {
  // console.log('App, theme:', customLightTheme)
  const uploaderRef = createRef<HTMLElement | null>(null)

  return (
    <JotaiProvider store={store}>
      <FluentProvider theme={lightTheme}>
        <uc-upload-ctx-provider
          id="uploaderctx"
          ref={uploaderRef}
          ctx-name="uploadcare-uploader"
        ></uc-upload-ctx-provider>
        <style dangerouslySetInnerHTML={{ __html: styleSheet() }} />
        <div
          style={routerContainerStyle}
          id="router-container"
        >
          <UploaderContext.Provider value={uploaderRef}>
            <RouterProvider
              router={router()}
              future={{ v7_startTransition: true }}
            />
          </UploaderContext.Provider>
        </div>
      </FluentProvider>
    </JotaiProvider>
  )
}
