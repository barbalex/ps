import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'

export const SubprojectForm = ({
  onChange,
  row,
  orIndex,
  from,
  autoFocusRef,
}) => (
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
      orIndex={orIndex}
      from={from}
    />
  </>
)
