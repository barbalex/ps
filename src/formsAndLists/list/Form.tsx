import { memo, useMemo } from 'react'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const ListForm = memo(({ onChange, row, orIndex, autoFocusRef }) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = useMemo(() => jsonbDataFromRow(row), [row])

  return (
    <>
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
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
      />
    </>
  )
})
