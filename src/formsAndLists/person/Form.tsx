import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const PersonForm = ({
  onChange,
  validations,
  row,
  orIndex,
  from,
  autoFocusRef,
}) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)

  return (
    <>
      <TextField
        label="Email"
        name="email"
        type="email"
        value={row.email ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.email?.state}
        validationMessage={validations?.email?.message}
      />
      <Jsonb
        table="persons"
        idField="person_id"
        id={row.person_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
      />
    </>
  )
}
