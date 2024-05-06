import { useRef, memo } from 'react'

import { Header } from './Header.tsx'
import { SubprojectForm } from './Form'

import '../../form.css'

export const Component = memo(() => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <SubprojectForm autoFocusRef={autoFocusRef} />
    </div>
  )
})
