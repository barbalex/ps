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

import { useElectric } from './ElectricProvider'
import { ElectricWrapper as ElectricProvider } from './ElectricWrapper'
import { lightTheme } from './modules/theme'
import { router } from './router'
import { SqlInitializer } from './components/SqlInitializer'
import { UploaderContext } from './UploaderContext'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const routerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100dvh',
}

const RouterProviderWithDb = () => {
  const { db } = useElectric()!
  // confirmed: this only runs once
  // console.log('RouterProviderWithDb', { db })

  return (
    <RouterProvider router={router(db)} future={{ v7_startTransition: true }} />
  )
}

export default function App() {
  // console.log('App, theme:', customLightTheme)
  const uploaderRef = createRef<HTMLElement | null>(null)

  return (
    <ElectricProvider>
      <lr-upload-ctx-provider
        ref={uploaderRef}
        ctx-name="uploadcare-uploader"
      ></lr-upload-ctx-provider>
      <style dangerouslySetInnerHTML={{ __html: styleSheet() }} />
      <SqlInitializer />
      <FluentProvider theme={lightTheme}>
        <div style={routerContainerStyle}>
          <UploaderContext.Provider value={uploaderRef}>
            <RouterProviderWithDb />
          </UploaderContext.Provider>
        </div>
      </FluentProvider>
    </ElectricProvider>
  )
}
