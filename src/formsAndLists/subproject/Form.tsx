import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'

type Props = {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  row: Record<string, any>
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

  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <TextField
        label={formatMessage({ id: 'bEkKpP', defaultMessage: 'Startjahr' })}
        name="start_year"
        value={row.start_year ?? ''}
        type="number"
        onChange={onChange}
        validationState={validations?.start_year?.state}
        validationMessage={validations?.start_year?.message}
      />
      <Jsonb
        table="subprojects"
        idField="subproject_id"
        id={row.subproject_id}
        data={row.data ?? {}}
        orIndex={orIndex}
        from={from}
      />
    </>
  )
}
