import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

type Validations = Record<
  string,
  | { state: 'error' | 'warning' | 'success' | 'none'; message: string }
  | undefined
>

type Props = {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  validations?: Validations
  row: Record<string, any>
  orIndex?: number
  from: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
}

// this form is rendered from a parent or outlet
export const GoalForm = ({
  onChange,
  validations,
  row,
  orIndex,
  from,
  autoFocusRef,
}: Props) => {
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
        value={row.year ?? ''}
        type="number"
        onChange={onChange}
        validationState={validations?.year?.state}
        validationMessage={validations?.year?.message}
      />
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
      <Jsonb
        table="goals"
        idField="goal_id"
        id={row.goal_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
      />
    </>
  )
}
