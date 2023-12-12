import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import deDe from 'antd/locale/de_DE'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import './style.css'
import { ElectricWrapper as ElectricProvider } from './ElectricProvider'

import { router } from './router'

export default function App() {
  return (
    <ElectricProvider>
      <ConfigProvider locale={deDe} theme={{ cssVar: true }}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </ConfigProvider>
    </ElectricProvider>
  )
}
