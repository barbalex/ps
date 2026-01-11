import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import type Lists from '../../models/public/Lists.ts'

import '../../form.css'

type Props = {
  onChange: (e: React.ChangeEvent<any>, data?: any) => Promise<void>
  validations: Record<string, { state: string; message: string }>
  row: Lists
  orIndex?: number
  autoFocusRef: React.Ref<HTMLInputElement>
}

// this form is rendered from a parent or outlet
export const ListForm = ({
  onChange,
  validations,
  row,
  orIndex,
  autoFocusRef,
}: Props) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)

  return (
    <>
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <Jsonb
        table="lists"
        idField="list_id"
        id={row.list_id}
        data={jsonbData}
        orIndex={orIndex}
      />
      <SwitchField
        label="Obsolete"
        name="obsolete"
        value={row.obsolete}
        onChange={onChange}
        validationState={validations?.obsolete?.state}
        validationMessage={validations?.obsolete?.message}
      />
    </>
  )
}
