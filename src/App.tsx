import React from 'react'
import { RouterProvider } from 'react-router-dom'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


import './style.css'
import { ElectricWrapper as ElectricProvider } from './ElectricProvider'

import { router } from './router'

export default function App() {
  return (
    <ElectricProvider>
        <RouterProvider
          router={router}
          future={{ v7_startTransition: true }}
        />
    </ElectricProvider>
  )
}
