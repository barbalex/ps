import { memo } from 'react'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const ActionReportForm = memo(
  ({ onChange, row, orIndex, from, autoFocusRef }) => {
    return (
      <>
        <TextField
          label="Year"
          name="year"
          value={row.year ?? ''}
          type="number"
          onChange={onChange}
        />
        <Jsonb
          table="action_reports"
          idField="action_report_id"
          id={row.action_report_id}
          data={row.data ?? {}}
          orIndex={orIndex}
          from={from}
          autoFocus
          ref={autoFocusRef}
        />
      </>
    )
  },
)
