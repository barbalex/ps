import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import deDe from 'antd/locale/de_DE'
import { FluentProvider } from '@fluentui/react-components'

import './style.css'
import {
  ElectricWrapper as ElectricProvider,
  useElectric,
} from './ElectricProvider'
import { lightTheme } from './modules/theme'
import { router } from './router'
import { LabelGenerator } from './components/LabelGenerator'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

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

  return (
    <ElectricProvider>
      <LabelGenerator />
      <ConfigProvider locale={deDe} theme={{ cssVar: true }}>
        <FluentProvider theme={lightTheme}>
          <RouterProviderWithDb />
        </FluentProvider>
      </ConfigProvider>
    </ElectricProvider>
  )
}
