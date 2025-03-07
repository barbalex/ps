import { memo, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import '../../form.css'

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

    const jsonbData = useMemo(
      () =>
        row.data ??
        Object.entries(row)
          .filter(([name]) => name.startsWith('data.'))
          .reduce((acc, [name, value]) => {
            acc[name.replace('data.', '')] = value
            return acc
          }, {}),
      [row],
    )

    console.log('Project.Form, row:', { row, jsonbData })

    return (
      <div
        className="form-container"
        role="tabpanel"
        aria-labelledby="form"
      >
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <Jsonb
          table="projects"
          idField="project_id"
          id={row.project_id}
          data={jsonbData}
          orIndex={orIndex}
        />
      </div>
    )
  },
)
