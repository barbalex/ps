import { useRef } from 'react'
import { useParams } from 'react-router-dom'

import { Header } from './Header'
import { FieldForm } from './Form'

import '../../form.css'

export const Component = () => {
  const { field_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <FieldForm
        field_id={field_id}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )
}
