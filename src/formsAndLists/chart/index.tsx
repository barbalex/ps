import { useRef } from 'react'

import { Header } from './Header.tsx'
import { Chart as ChartComponent } from './Chart/index.tsx'

import '../../form.css'

export const Chart = ({ from }: { from: string }) => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <ChartComponent from={from} />
    </div>
  )
}
