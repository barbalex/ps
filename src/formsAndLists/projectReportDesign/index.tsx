import { useRef } from 'react'

import { Header } from './Header.tsx'
import { Form } from './Form.tsx'

import '../../form.css'

const from = '/data/projects/$projectId_/designs/$projectReportDesignId/'

export const ProjectReportDesign = () => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <Form
        autoFocusRef={autoFocusRef}
        from={from}
      />
    </div>
  )
}
