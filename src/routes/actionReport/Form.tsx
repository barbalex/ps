import { memo } from 'react'
import { useOutletContext } from 'react-router'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(
  ({ onChange: onChangeFromProps, row: rowFromProps, autoFocusRef }) => {
    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const row = rowFromProps ?? outletContext?.row ?? {}

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
          autoFocus
          ref={autoFocusRef}
        />
      </>
    )
  },
)
