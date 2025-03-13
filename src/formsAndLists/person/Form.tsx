import { memo, useMemo } from 'react'
import { useOutletContext } from 'react-router'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(
  ({ onChange: onChangeFromProps, row: rowFromProps, autoFocusRef }) => {
    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const row = useMemo(
      () => rowFromProps ?? outletContext?.row ?? {},
      [outletContext?.row, rowFromProps],
    )
    const orIndex = outletContext?.orIndex

    // need to extract the jsonb data from the row
    // as inside filters it's name is a path
    // instead of it being inside of the data field
    const jsonbData = useMemo(() => jsonbDataFromRow(row), [row])

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
        />
        <Jsonb
          table="persons"
          idField="person_id"
          id={row.person_id}
          data={jsonbData}
          orIndex={orIndex}
        />
      </>
    )
  },
)
