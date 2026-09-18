import { DateField } from '../../components/shared/DateField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { EditingGeometry } from '../../components/shared/EditingGeometry.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import type { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { useIntl } from 'react-intl'

import '../../form.css'

export type Validations = Record<
  string,
  | { state: 'error' | 'warning' | 'success' | 'none'; message: string }
  | undefined
>

type Props = {
  onChange: (...args: Parameters<typeof getValueFromChange>) => void
  validations?: Validations
  row: Record<string, unknown>
  orIndex?: number
  from: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
}

// this form is rendered from a parent or outlet
export const ActionForm = ({
  onChange,
  validations = {},
  row,
  orIndex,
  from,
  autoFocusRef,
}: Props) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)
  const { formatMessage } = useIntl()
  // field components declare narrower Fluent change-data types than the shared handler
  const onChangeField =
    onChange as unknown as (
      e: React.ChangeEvent<HTMLInputElement>,
      data?: unknown,
    ) => void

  return (
    <>
      <DateField
        label={formatMessage({ id: 'bEoOtT', defaultMessage: 'Datum' })}
        name="date"
        value={row.date}
        onChange={onChangeField}
        validationState={validations?.date?.state}
        validationMessage={validations?.date?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'bEpPuU', defaultMessage: 'Relevant für Berichte' })}
        name="relevant_for_reports"
        value={row.relevant_for_reports as boolean | null | undefined}
        onChange={onChangeField}
        validationState={validations?.relevant_for_reports?.state}
        validationMessage={validations?.relevant_for_reports?.message}
      />
      <Jsonb
        table="actions"
        idField="action_id"
        id={row.action_id as string}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
        autoFocus
        ref={autoFocusRef as unknown as React.Ref<HTMLDivElement>}
      />
      <EditingGeometry
        row={
          row as {
            place_id?: string
            action_id?: string
            check_id?: string
            geometry?: unknown
          }
        }
        table="actions"
      />
    </>
  )
}
