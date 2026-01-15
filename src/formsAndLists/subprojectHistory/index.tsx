import { useRef } from 'react'

import { Header } from './Header.tsx'
import { SubprojectHistoryForm as Form } from './Form.tsx'

import '../../form.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/histories/$subprojectHistoryId'

export const SubprojectHistory = () => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <div
        className="form-container"
        role="tabpanel"
        aria-labelledby="form"
      >
        <Form
          autoFocusRef={autoFocusRef}
          from={from}
        />
      </div>
    </div>
  )
}
