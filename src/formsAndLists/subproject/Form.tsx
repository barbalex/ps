import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'

export const SubprojectForm = ({
  onChange,
  row,
  orIndex,
  from,
  autoFocusRef,
  validations = {},
}) => (
  <>
    <TextField
      label="Name"
      name="name"
      value={row.name ?? ''}
      onChange={onChange}
      autoFocus
      ref={autoFocusRef}
      validationState={validations.name?.state}
      validationMessage={validations.name?.message}
    />
    <TextField
      label="Start year"
      name="start_year"
      value={row.start_year ?? ''}
      type="number"
      onChange={onChange}
      validationState={validations.start_year?.state}
      validationMessage={validations.start_year?.message}
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
