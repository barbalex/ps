import React, { createRef } from 'react'
import { RouterProvider } from 'react-router-dom'
import { FluentProvider } from '@fluentui/react-components'

import * as LR from '@uploadcare/blocks'
LR.FileUploaderRegular.shadowStyles = /* CSS */ `
  :host lr-copyright {
    display: none;
  }
  :host lr-simple-btn {
    display: none;
  }
`
LR.registerBlocks(LR)

import { styleSheet } from './css'
import 'allotment/dist/style.css'
import './style.css'

import { lightTheme } from './modules/theme'
import { router } from './router'
import { UploaderContext } from './UploaderContext'

const routerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100dvh',
}

export default function App() {
  // console.log('App, theme:', customLightTheme)
  const uploaderRef = createRef<HTMLElement | null>(null)

  return (
    <FluentProvider theme={lightTheme}>
      <lr-upload-ctx-provider
        ref={uploaderRef}
        ctx-name="uploadcare-uploader"
      ></lr-upload-ctx-provider>
      <style dangerouslySetInnerHTML={{ __html: styleSheet() }} />
      <div style={routerContainerStyle}>
        <UploaderContext.Provider value={uploaderRef}>
          <RouterProvider
            router={router()}
            future={{ v7_startTransition: true }}
          />
        </UploaderContext.Provider>
      </div>
    </FluentProvider>
  )
}
