import { useCallback, useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/$goalReportValueId/'

export const GoalReportValue = memo(() => {
  const { goalReportValueId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `select * from goal_report_values where goal_report_value_id = $1`,
    [goalReportValueId],
    'goal_report_value_id',
  )
  const row = res?.rows?.[0]

  // console.log('GoalReportValue', { row, results })

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(
        `UPDATE goal_report_values SET ${name} = $1 WHERE goal_report_value_id = $2`,
        [value, goalReportValueId],
      )
    },
    [db, goalReportValueId, row],
  )

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Goal Report Value"
        id={goalReportValueId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <DropdownField
          label="Unit"
          name="unit_id"
          table="units"
          where="use_for_goal_report_values is true"
          orderBy="sort, name"
          value={row.unit_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Value (integer)"
          name="value_integer"
          type="number"
          value={row.value_integer ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (numeric)"
          name="value_numeric"
          type="number"
          value={row.value_numeric ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (text)"
          name="value_text"
          value={row.value_text ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
})
