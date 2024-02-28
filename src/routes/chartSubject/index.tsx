import { useRef } from 'react'

import { Header } from './Header'
import { ChartSubjectForm } from './Form'

import '../../form.css'

export const Component = () => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <ChartSubjectForm autoFocusRef={autoFocusRef} />
    </div>
  )
}
