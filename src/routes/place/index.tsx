import { useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Header } from './Header.tsx'
import { PlaceForm } from './Form.tsx'

import '../../form.css'

export const Component = () => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  if (onlyForm) {
    return <PlaceForm />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <PlaceForm autoFocusRef={autoFocusRef} />
    </div>
  )
}
