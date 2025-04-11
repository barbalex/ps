import { useCallback, useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { SubprojectReportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

export const SubprojectReport = memo(({ from }) => {
  const { subprojectReportId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM subproject_reports WHERE subproject_report_id = $1`,
    [subprojectReportId],
    'subproject_report_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(
        `UPDATE subproject_reports SET ${name} = $1 WHERE subproject_report_id = $2`,
        [value, subprojectReportId],
      )
    },
    [db, row, subprojectReportId],
  )

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Report"
        id={subprojectReportId}
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
