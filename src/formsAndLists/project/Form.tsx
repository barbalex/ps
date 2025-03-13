import { memo, useMemo } from 'react'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import '../../form.css'

// TODO: learn how to pass row, onChange and orIndex from filter to this form using tanstack/react-router
// react-router passed via outlet context
export const ProjectForm = memo(({ onChange, row, orIndex, autoFocusRef, Route }) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = useMemo(() => jsonbDataFromRow(row), [row])

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
        Route={Route}
      />
    </div>
  )
})
