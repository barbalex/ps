import { useRef, memo } from 'react'

import { Header } from './Header.tsx'
import { Component as Form } from './Form.tsx'

import '../../form.css'

export const CRS = memo(() => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form autoFocusRef={autoFocusRef} />
      </div>
    </div>
  )
})
