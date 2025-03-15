import { useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'

import { Header } from './Header.tsx'
import { FieldFormFetchingOwnData } from './FormFetchingOwnData.tsx'

import '../../form.css'

export const Field = memo(({ from }) => {
  const { fieldId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <FieldFormFetchingOwnData
        fieldId={fieldId}
        from={from}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )
})
