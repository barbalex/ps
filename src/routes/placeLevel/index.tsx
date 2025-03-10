import { useCallback, useRef, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { updateTableVectorLayerLabels } from '../../modules/updateTableVectorLayerLabels.ts'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { place_level_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM place_levels WHERE place_level_id = $1`,
    [place_level_id],
    'place_level_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(
        `UPDATE place_levels SET ${name} = $1 WHERE place_level_id = $2`,
        [value, place_level_id],
      )
      // if name_plural was changed, need to update the label of corresponding vector layers
      if (
        row &&
        [
          'name_plural',
          'name_singular',
          'actions',
          'checks',
          'occurrences',
        ].includes(name) &&
        row.level &&
        row.project_id
      ) {
        await updateTableVectorLayerLabels({
          db,
          project_id: row.project_id,
        })
      }
    },
    [db, place_level_id, row],
  )

  if (!row) return <Loading />

  // console.log('place level', row)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <RadioGroupField
          label="Level"
          name="level"
          list={[1, 2]}
          value={row.level ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Name (singular)"
          name="name_singular"
          value={row.name_singular ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Name (plural)"
          name="name_plural"
          value={row.name_plural ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Name (short)"
          name="name_short"
          value={row.name_short ?? ''}
          onChange={onChange}
        />
        <SwitchField
          label="Enable reports"
          name="reports"
          value={row.reports ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable report values"
          name="report_values"
          value={row.report_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable actions"
          name="actions"
          value={row.actions ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable action values"
          name="action_values"
          value={row.action_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable action reports"
          name="action_reports"
          value={row.action_reports ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable checks"
          name="checks"
          value={row.checks ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable check values"
          name="check_values"
          value={row.check_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable check taxa"
          name="check_taxa"
          value={row.check_taxa ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable occurrences"
          name="occurrences"
          value={row.occurrences ?? false}
          onChange={onChange}
        />
      </div>
    </div>
  )
})
