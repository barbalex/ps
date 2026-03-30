import { useIntl } from 'react-intl'
import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const CheckReportForm = ({
  onChange,
  validations,
  row,
  orIndex,
  from,
  autoFocusRef,
}) => {
  const { formatMessage } = useIntl()
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
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
        table="check_reports"
        idField="place_check_report_id"
        id={row.place_check_report_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
        autoFocus
        ref={autoFocusRef}
      />
    </>
  )
}
