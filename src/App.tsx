import React from 'react'
import { RouterProvider } from 'react-router-dom'

import './style.css'
import { ElectricWrapper as ElectricProvider } from './ElectricProvider'

import { router } from './router'

export default function App() {
  return (
    <ElectricProvider>
      {(db) => (
        <RouterProvider
          router={router(db)}
          future={{ v7_startTransition: true }}
        />
      )}
    </ElectricProvider>
  )
}
