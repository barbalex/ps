import { useRef } from 'react'

import { Header } from './Header.tsx'
import { ProjectCrsForm as Form } from './Form.tsx'

import '../../form.css'

export const ProjectCrs = () => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form autoFocusRef={autoFocusRef} />
      </div>
    </div>
  )
}
