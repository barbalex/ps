import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'

export const SubprojectHistoryForm = ({
  onChange,
  row,
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
    <TextField
      label="End year"
      name="end_year"
      value={row.end_year ?? ''}
      type="number"
      onChange={onChange}
      validationState={validations.end_year?.state}
      validationMessage={validations.end_year?.message}
    />
    <Jsonb
      table="subproject_histories"
      idField="subproject_history_id"
      id={row.subproject_history_id}
      data={row.data ?? {}}
      from={from}
    />
  </>
)
