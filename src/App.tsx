import React from 'react'
import { RouterProvider } from 'react-router-dom'

import logo from './logo.svg'
import './App.css'
import './style.css'
import { ElectricWrapper as ElectricProvider } from './ElectricProvider'

import { router } from './router'

export default function App() {
  return (
    <ElectricProvider>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <RouterProvider router={router} />
        </header>
      </div>
    </ElectricProvider>
  )
}
