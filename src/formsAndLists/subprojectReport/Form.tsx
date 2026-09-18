import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import type SubprojectReports from '../../models/public/SubprojectReports.ts'

import '../../form.css'

type Props = {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  row: Record<string, any> | SubprojectReports
  orIndex?: number
  from: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  validations?: Record<string, { state: 'error'; message: string }>
}

// this form is rendered from a parent or outlet
export const SubprojectReportForm = ({
  onChange,
  row,
  orIndex,
  from,
  autoFocusRef,
  validations = {},
}: Props) => {
  const { formatMessage } = useIntl()

  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row as Record<string, unknown>)

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
        table="subproject_reports"
        idField="subproject_report_id"
        id={row.subproject_report_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
        autoFocus
        ref={autoFocusRef as unknown as React.Ref<HTMLDivElement>}
      />
    </>
  )
}
