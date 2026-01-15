import { useRef } from 'react'

import { Header } from './Header.tsx'
import { PlaceHistoryForm as Form } from './Form.tsx'

import '../../form.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/histories/$placeHistoryId'

export const PlaceHistory = () => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <Form
        autoFocusRef={autoFocusRef}
        from={from}
      />
    </div>
  )
}
