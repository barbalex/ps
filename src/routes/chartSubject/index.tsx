import { useRef } from 'react'

import { Header } from './Header'
import { ChartSubjectForm } from './Form'

import '../../form.css'

export const Component = () => {
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
}
