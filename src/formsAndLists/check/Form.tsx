import { DateField } from '../../components/shared/DateField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { JsonbOrFormDesign } from '../../components/shared/FormDesign/index.tsx'
import { WithFormDesign } from '../../components/shared/FormDesign/WithFormDesign.tsx'
import { FormColumn } from '../../components/shared/FormDesign/FormColumn.tsx'
import type { FormColumns } from '../../components/shared/FormDesign/FormDesignRuntimeContext.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import { useIntl } from 'react-intl'
import type Checks from '../../models/public/Checks.ts'

import '../../form.css'
import type { FieldChangeHandler } from '../../components/shared/fieldChange.ts'

// this form is rendered from a parent or outlet
export const CheckForm = ({
  onChange,
  validations,
  row,
  orIndex,
  from,
  autoFocusRef,
  fieldIds,
}: {
  onChange: FieldChangeHandler
  validations?: Record<
    string,
    | { state?: 'error' | 'warning' | 'success' | 'none'; message?: string }
    | undefined
  >
  row: Checks
  orIndex?: number
  from?: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  /** restrict rendering to these field_ids (field group of a table view) */
  fieldIds?: string[]
}) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row as unknown as Record<string, unknown>)
  const { formatMessage } = useIntl()

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
      table="checks"
      idField="check_id"
      id={row.check_id}
      data={jsonbData}
      from={from}
      columns={columns}
      onChange={onChange}
    >
      <FormColumn column="date" />
      <FormColumn column="relevant_for_reports" />
      <JsonbOrFormDesign
        table="checks"
        idField="check_id"
        id={row.check_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from ?? ''}
        autoFocus
        ref={autoFocusRef as unknown as React.Ref<HTMLDivElement>}
        fieldIds={fieldIds}
      />
    </WithFormDesign>
  )
}
