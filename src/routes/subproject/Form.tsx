import { memo } from 'react'
import { useOutletContext } from 'react-router'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'

export const Component = memo(
  ({ onChange: onChangeFromProps, row: rowFromProps, autoFocusRef }) => {
    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const row = rowFromProps ?? outletContext?.row ?? {}

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
        <TextField
          label="Start year"
          name="start_year"
          value={row.start_year ?? ''}
          type="number"
          onChange={onChange}
        />
        <Jsonb
          table="subprojects"
          idField="subproject_id"
          id={row.subproject_id}
          data={row.data ?? {}}
        />
      </>
    )
  },
)
