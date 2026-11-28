import { useIntl } from 'react-intl'
import type Subprojects from '../../models/public/Subprojects.ts'

import { TextField } from '../../components/shared/TextField.tsx'
import { JsonbOrFormDesign } from '../../components/shared/FormDesign/index.tsx'
import { WithFormDesign } from '../../components/shared/FormDesign/WithFormDesign.tsx'
import { FormColumn } from '../../components/shared/FormDesign/FormColumn.tsx'
import type { FormColumns } from '../../components/shared/FormDesign/FormDesignRuntimeContext.tsx'
import type { FieldChangeHandler } from '../../components/shared/fieldChange.ts'

type Props = {
  onChange: FieldChangeHandler
  row: Subprojects | Record<string, never>
  orIndex?: number
  from: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  validations?: Record<string, { state: 'error'; message: string }>
}

export const SubprojectForm = ({
  onChange,
  row,
  orIndex,
  from,
  autoFocusRef,
  validations = {},
}: Props) => {
  const { formatMessage } = useIntl()

  // the table's real columns: placeable in a form design like the jsonb
  // keys, and drawn at their fixed position until a design places them
  const columns: FormColumns = {
    name: {
      label: formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' }),
      render: ({ label, onChange }) => (
        <TextField
          label={label}
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.name?.state}
          validationMessage={validations?.name?.message}
        />
      ),
    },
    start_year: {
      label: formatMessage({ id: 'bEkKpP', defaultMessage: 'Startjahr' }),
      render: ({ label, onChange }) => (
        <TextField
          label={label}
          name="start_year"
          value={row.start_year ?? ''}
          type="number"
          onChange={onChange}
          validationState={validations?.start_year?.state}
          validationMessage={validations?.start_year?.message}
        />
      ),
    },
  }

  return (
    <WithFormDesign
      table="subprojects"
      idField="subproject_id"
      id={row.subproject_id}
      data={(row.data ?? {}) as Record<string, unknown>}
      from={from}
      columns={columns}
      onChange={onChange}
    >
      <FormColumn column="name" />
      <FormColumn column="start_year" />
      <JsonbOrFormDesign
        table="subprojects"
        idField="subproject_id"
        id={row.subproject_id}
        data={(row.data ?? {}) as Record<string, unknown>}
        orIndex={orIndex}
        from={from}
      />
    </WithFormDesign>
  )
}
