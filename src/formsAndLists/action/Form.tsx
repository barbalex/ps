import { DateField } from '../../components/shared/DateField.tsx'
import type Actions from '../../models/public/Actions.ts'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { JsonbOrFormDesign } from '../../components/shared/FormDesign/index.tsx'
import { WithFormDesign } from '../../components/shared/FormDesign/WithFormDesign.tsx'
import { FormColumn } from '../../components/shared/FormDesign/FormColumn.tsx'
import type { FormColumns } from '../../components/shared/FormDesign/FormDesignRuntimeContext.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import type { FieldChangeHandler } from '../../components/shared/fieldChange.ts'
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
  row: Actions | Record<string, never>
  orIndex?: number
  from: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  /** restrict rendering to these field_ids (field group of a table view) */
  fieldIds?: string[]
}

// this form is rendered from a parent or outlet
export const ActionForm = ({
  onChange,
  validations = {},
  row,
  orIndex,
  from,
  autoFocusRef,
  fieldIds,
}: Props) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)
  const { formatMessage } = useIntl()
  // field components declare narrower Fluent change-data types than the shared handler
  const onChangeField = onChange as unknown as FieldChangeHandler

  // the table's real columns: placeable in a form design like the jsonb
  // keys, and drawn at their fixed position until a design places them
  const columns: FormColumns = {
    date: {
      label: formatMessage({ id: 'bEoOtT', defaultMessage: 'Datum' }),
      render: ({ label, onChange }) => (
        <DateField
          label={label}
          name="date"
          value={row.date}
          onChange={onChange}
          validationState={validations?.date?.state}
          validationMessage={validations?.date?.message}
        />
      ),
    },
    relevant_for_reports: {
      label: formatMessage({
        id: 'bEpPuU',
        defaultMessage: 'Relevant für Berichte',
      }),
      render: ({ label, onChange }) => (
        <SwitchField
          label={label}
          name="relevant_for_reports"
          value={row.relevant_for_reports as boolean | null | undefined}
          onChange={onChange}
          validationState={validations?.relevant_for_reports?.state}
          validationMessage={validations?.relevant_for_reports?.message}
        />
      ),
    },
  }

  return (
    <WithFormDesign
      table="actions"
      idField="action_id"
      id={row.action_id as string}
      data={jsonbData}
      from={from}
      columns={columns}
      onChange={onChangeField}
    >
      <FormColumn column="date" />
      <FormColumn column="relevant_for_reports" />
      <JsonbOrFormDesign
        table="actions"
        idField="action_id"
        id={row.action_id as string}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
        autoFocus
        ref={autoFocusRef as unknown as React.Ref<HTMLDivElement>}
        fieldIds={fieldIds}
      />
    </WithFormDesign>
  )
}
