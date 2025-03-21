import { useRef, memo } from 'react'
import { useAtom } from 'jotai'

import { Header } from './Header.tsx'
import { Form } from './Form.tsx'
import { Chart as ChartComponent } from './Chart/index.tsx'
import { designingAtom } from '../../store.ts'

import '../../form.css'

// if editing, show form
// if not editing, show chart
export const Chart = memo(() => {
  const [designing] = useAtom(designingAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)

  // prevent Chart from being very shortly loaded while designing is undefined
  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      {designing ? <Form autoFocusRef={autoFocusRef} /> : <ChartComponent />}
    </div>
  )
})
