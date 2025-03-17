import { memo, useMemo } from 'react'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const ProjectReportForm = memo(
  ({ onChange, row, orIndex, autoFocusRef }) => {
    // need to extract the jsonb data from the row
    // as inside filters it's name is a path
    // instead of it being inside of the data field
    const jsonbData = useMemo(() => jsonbDataFromRow(row), [row])

    return (
      <>
        <TextField
          label="Year"
          name="year"
          type="number"
          value={row.year ?? ''}
          onChange={onChange}
        />
        <Jsonb
          table="project_reports"
          idField="project_report_id"
          id={row.project_report_id}
          data={jsonbData}
          orIndex={orIndex}
          autoFocus
          ref={autoFocusRef}
        />
      </>
    )
  },
)
