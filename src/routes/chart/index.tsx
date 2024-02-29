import { useRef, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { Header } from './Header'
import { Form } from './Form'
import { Chart } from './Chart'
import { useElectric } from '../../ElectricProvider'
import { user_id } from '../../components/SqlInitializer'

import '../../form.css'

// if editing, show form
// if not editing, show chart
export const Component = memo(() => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const designing = uiOption?.designing ?? false

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      {designing ? <Form autoFocusRef={autoFocusRef} /> : <Chart />}
    </div>
  )
})
