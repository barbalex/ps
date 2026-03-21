import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { useIntl } from 'react-intl'

import '../../form.css'

// this form is rendered from a parent or outlet
export const CheckReportForm = ({
  onChange,
  validations = {},
  row,
  orIndex,
  from,
  autoFocusRef,
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <TextField
        label={formatMessage({ id: 'bB4FgH', defaultMessage: 'Jahr' })}
        name="year"
        value={row.year ?? ''}
        type="number"
        onChange={onChange}
        validationState={validations?.year?.state}
        validationMessage={validations?.year?.message}
      />
      <Jsonb
        table="check_reports"
        idField="check_report_id"
        id={row.check_report_id}
        data={row.data ?? {}}
        orIndex={orIndex}
        from={from}
        autoFocus
        ref={autoFocusRef}
      />
    </>
  )
}
