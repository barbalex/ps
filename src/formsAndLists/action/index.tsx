import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ActionForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

export const Action = ({ from }) => {
  const { actionId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM actions WHERE action_id = $1`,
    [actionId],
    'action_id',
  )
  const row = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(`UPDATE actions SET ${name} = $1 WHERE action_id = $2`, [
      value,
      actionId,
    ])
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Action"
        id={actionId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <div className="form-container">
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          from={from}
        />
      </div>
    </div>
  )
}
