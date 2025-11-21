import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import '../../form.css'

export const ProjectForm = ({ onChange, row, orIndex, autoFocusRef, from }) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)

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
        from={from}
      />
    </div>
  )
}
