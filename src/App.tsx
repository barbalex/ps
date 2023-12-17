import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import deDe from 'antd/locale/de_DE'
import { ThemeProvider } from '@fluentui/react'

import './style.css'
import { ElectricWrapper as ElectricProvider } from './ElectricProvider'
import { theme } from './modules/theme'

import { router } from './router'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

export default function App() {
  return (
    <ElectricProvider>
      <ConfigProvider locale={deDe} theme={{ cssVar: true }}>
        <ThemeProvider theme={theme}>
          <RouterProvider
            router={router}
            future={{ v7_startTransition: true }}
          />
        </ThemeProvider>
      </ConfigProvider>
    </ElectricProvider>
  )
}
