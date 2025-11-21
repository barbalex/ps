import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const GoalForm = meo(
  ({ onChange, row, orIndex, from, autoFocusRef }) => {
    // need to extract the jsonb data from the row
    // as inside filters it's name is a path
    // instead of it being inside of the data field
    const jsonbData = jsonbDataFromRow(row)

    return (
      <>
        <TextField
          label="Year"
          name="year"
          value={row.year ?? ''}
          type="number"
          onChange={onChange}
        />
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <Jsonb
          table="goals"
          idField="goal_id"
          id={row.goal_id}
          data={jsonbData}
          orIndex={orIndex}
          from={from}
        />
      </>
    )
  },
)
