import { useRef } from 'react'

import { Header } from './Header.tsx'
import { PlaceHistoryForm as Form } from './Form.tsx'

import '../../form.css'

export const PlaceHistory = () => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <Form autoFocusRef={autoFocusRef} />
    </div>
  )
}
