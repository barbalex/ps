import { useCallback, useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ActionReportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

export const ActionReport = memo(({ from }) => {
  const { actionReportId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM action_reports WHERE action_report_id = $1`,
    [actionReportId],
    'action_report_id',
  )
  const row = res?.rows?.[0]

  // console.log('ActionReport', { row, results })

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(
        `UPDATE action_reports SET ${name} = $1 WHERE action_report_id = $2`,
        [value, actionReportId],
      )
    },
    [row, db, actionReportId],
  )

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Action Report"
        id={actionReportId}
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
})
