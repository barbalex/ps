import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import type FieldTypes from '../../models/public/FieldTypes.ts'

import '../../form.css'
import type { FieldChangeData } from '../../components/shared/fieldChange.ts'

type Props = {
  onChange: (e: React.ChangeEvent<HTMLElement>, data?: FieldChangeData) => void
  validations?: Record<
    string,
    | { state: 'error' | 'warning' | 'success' | 'none'; message: string }
    | undefined
  >
  row: FieldTypes | Record<string, never>
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
}

export const FieldTypeForm = ({
  onChange,
  validations,
  row,
  autoFocusRef,
}: Props) => {
  const { formatMessage } = useIntl()
  const fieldTypeRow = row as unknown as FieldTypes

  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={fieldTypeRow.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <TextField
        label={formatMessage({
          id: 'Pq7nWk',
          defaultMessage: 'Sortier-Reihenfolge',
        })}
        name="sort"
        value={fieldTypeRow.sort ?? ''}
        onChange={onChange}
        validationState={validations?.sort?.state}
        validationMessage={validations?.sort?.message}
      />
      <TextField
        label={formatMessage({ id: 'Rm4jTs', defaultMessage: 'Bemerkungen' })}
        name="comment"
        value={fieldTypeRow.comment ?? ''}
        onChange={onChange}
        validationState={validations?.comment?.state}
        validationMessage={validations?.comment?.message}
      />
    </>
  )
}
