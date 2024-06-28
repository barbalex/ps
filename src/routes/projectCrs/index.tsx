import { useRef, memo } from 'react'
import { useParams } from 'react-router-dom'

import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Header } from './Header.tsx'
import { Component as Form } from './Form.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { project_crs_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive label="ID" name="project_crs_id" value={project_crs_id} />
        <Form autoFocusRef={autoFocusRef} />
      </div>
    </div>
  )
})
