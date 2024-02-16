import { useRef } from 'react'

import { Header } from './Header'
import { PlaceForm } from './Form'

import '../../form.css'

export const Component = () => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <PlaceForm autoFocusRef={autoFocusRef} />
    </div>
  )
}
