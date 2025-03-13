import { useRef, memo } from 'react'

import { Header } from './Header.tsx'
import { ChartSubjectForm } from './Form.tsx'

import '../../form.css'

export const Component = memo(() => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  // TODO:
  // if editing, show the form
  // if not editing, show the chart
  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <ChartSubjectForm autoFocusRef={autoFocusRef} />
    </div>
  )
})
