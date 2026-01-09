import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const ActionReportForm = ({
  onChange,
  validations = {},
  row,
  orIndex,
  from,
  autoFocusRef,
}) => (
  <>
    <TextField
      label="Year"
      name="year"
      value={row.year ?? ''}
      type="number"
      onChange={onChange}
      validationState={validations.year?.state}
      validationMessage={validations.year?.message}
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
