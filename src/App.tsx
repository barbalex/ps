import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { FluentProvider } from '@fluentui/react-components'

import './style.css'
import { ElectricWrapper as ElectricProvider } from './ElectricProvider'
import { lightTheme } from './modules/theme'
import { router } from './router'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

export default function App() {
  // console.log('App, theme:', customLightTheme)

  return (
    <ElectricProvider>
      <FluentProvider theme={lightTheme}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </FluentProvider>
    </ElectricProvider>
  )
}
