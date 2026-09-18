import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'

import { Header } from './Header.tsx'
import { FieldFormFetchingOwnData } from './FormFetchingOwnData.tsx'

import '../../form.css'

export const Field = ({ from }: { from: string }) => {
  const { fieldId } = useParams({ strict: false })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <FieldFormFetchingOwnData
        fieldId={fieldId}
        from={from}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )
}
