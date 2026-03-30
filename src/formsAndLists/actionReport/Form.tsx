import { useIntl } from 'react-intl'
import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const ActionReportForm = ({
  onChange,
  validations,
  row,
  orIndex,
  from,
  autoFocusRef,
}) => {
  const { formatMessage } = useIntl()
  const jsonbData = jsonbDataFromRow(row)

  return (
    <>
      <TextField
        label={formatMessage({ id: 'bB4FgH', defaultMessage: 'Jahr' })}
        name="year"
        type="number"
        value={row.year ?? ''}
        onChange={onChange}
        validationState={validations?.year?.state}
        validationMessage={validations?.year?.message}
      />
      <Jsonb
        table="action_reports"
        idField="place_action_report_id"
        id={row.place_action_report_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
        autoFocus
        ref={autoFocusRef}
      />
    </>
  )
}
