import { useRef } from 'react'
import { useParams } from 'react-router-dom'

import { Header } from './Header.tsx'
import { FieldFormFetchingOwnData } from './FormFetchingOwnData.tsx'

import '../../form.css'

export const Component = () => {
  const { field_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <FieldFormFetchingOwnData field_id={field_id} autoFocusRef={autoFocusRef} />
    </div>
  )
}
