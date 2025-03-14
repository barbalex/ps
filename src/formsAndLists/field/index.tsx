import { useRef, memo } from 'react'
import { useParams } from 'react-router'

import { Header } from './Header.tsx'
import { FieldFormFetchingOwnData } from './FormFetchingOwnData.tsx'

import '../../form.css'

export const Component = memo(({ from }) => {
  const { fieldId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <FieldFormFetchingOwnData
        field_id={fieldId}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )
})
