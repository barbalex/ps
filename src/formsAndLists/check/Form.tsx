import { DateField } from '../../components/shared/DateField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { EditingGeometry } from '../../components/shared/EditingGeometry.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import { useIntl } from 'react-intl'
import type Checks from '../../models/public/Checks.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const CheckForm = ({
  onChange,
  validations,
  row,
  orIndex,
  from,
  autoFocusRef,
}: {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  validations?: Record<
    string,
    | { state?: 'error' | 'warning' | 'success' | 'none'; message?: string }
    | undefined
  >
  row: Checks
  orIndex?: number
  from?: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
}) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row as unknown as Record<string, unknown>)
  const { formatMessage } = useIntl()

  return (
    <>
      <DateField
        label={formatMessage({ id: 'bEoOtT', defaultMessage: 'Datum' })}
        name="date"
        value={row.date}
        onChange={onChange}
        validationState={validations?.date?.state}
        validationMessage={validations?.date?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'bEpPuU', defaultMessage: 'Relevant für Berichte' })}
        name="relevant_for_reports"
        value={row.relevant_for_reports as never}
        onChange={onChange}
        validationState={validations?.relevant_for_reports?.state}
        validationMessage={validations?.relevant_for_reports?.message}
      />
      <Jsonb
        table="checks"
        idField="check_id"
        id={row.check_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from ?? ''}
        autoFocus
        ref={autoFocusRef as unknown as React.Ref<HTMLDivElement>}
      />
      <EditingGeometry
        row={row as unknown as {
          place_id?: string
          action_id?: string
          check_id?: string
          geometry?: unknown
        }}
        table="checks"
      />
    </>
  )
}
