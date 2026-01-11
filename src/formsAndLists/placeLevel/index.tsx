import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { updateTableVectorLayerLabels } from '../../modules/updateTableVectorLayerLabels.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type PlaceLevels from '../../models/public/PlaceLevels.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/place-levels/$placeLevelId/'

export const PlaceLevel = () => {
  const { placeLevelId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM place_levels WHERE place_level_id = $1`,
    [placeLevelId],
  )
  const row: PlaceLevels | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE place_levels SET ${name} = $1 WHERE place_level_id = $2`,
        [value, placeLevelId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'place_levels',
      rowIdName: 'place_level_id',
      rowId: placeLevelId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
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
        project_id: row.project_id,
      })
    }
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Place Level" id={placeLevelId} />
  }

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
          validationState={validations.level?.state}
          validationMessage={validations.level?.message}
        />
        <TextField
          label="Name (singular)"
          name="name_singular"
          value={row.name_singular ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations.name_singular?.state}
          validationMessage={validations.name_singular?.message}
        />
        <TextField
          label="Name (plural)"
          name="name_plural"
          value={row.name_plural ?? ''}
          onChange={onChange}
          validationState={validations.name_plural?.state}
          validationMessage={validations.name_plural?.message}
        />
        <TextField
          label="Name (short)"
          name="name_short"
          value={row.name_short ?? ''}
          onChange={onChange}
          validationState={validations.name_short?.state}
          validationMessage={validations.name_short?.message}
        />
        <SwitchField
          label="Enable reports"
          name="reports"
          value={row.reports ?? false}
          onChange={onChange}
          validationState={validations.reports?.state}
          validationMessage={validations.reports?.message}
        />
        <SwitchField
          label="Enable report values"
          name="report_values"
          value={row.report_values ?? false}
          onChange={onChange}
          validationState={validations.report_values?.state}
          validationMessage={validations.report_values?.message}
        />
        <SwitchField
          label="Enable actions"
          name="actions"
          value={row.actions ?? false}
          onChange={onChange}
          validationState={validations.actions?.state}
          validationMessage={validations.actions?.message}
        />
        <SwitchField
          label="Enable action values"
          name="action_values"
          value={row.action_values ?? false}
          onChange={onChange}
          validationState={validations.action_values?.state}
          validationMessage={validations.action_values?.message}
        />
        <SwitchField
          label="Enable action reports"
          name="action_reports"
          value={row.action_reports ?? false}
          onChange={onChange}
          validationState={validations.action_reports?.state}
          validationMessage={validations.action_reports?.message}
        />
        <SwitchField
          label="Enable checks"
          name="checks"
          value={row.checks ?? false}
          onChange={onChange}
          validationState={validations.checks?.state}
          validationMessage={validations.checks?.message}
        />
        <SwitchField
          label="Enable check values"
          name="check_values"
          value={row.check_values ?? false}
          onChange={onChange}
          validationState={validations.check_values?.state}
          validationMessage={validations.check_values?.message}
        />
        <SwitchField
          label="Enable check taxa"
          name="check_taxa"
          value={row.check_taxa ?? false}
          onChange={onChange}
          validationState={validations.check_taxa?.state}
          validationMessage={validations.check_taxa?.message}
        />
        <SwitchField
          label="Enable occurrences"
          name="occurrences"
          value={row.occurrences ?? false}
          onChange={onChange}
          validationState={validations.occurrences?.state}
          validationMessage={validations.occurrences?.message}
        />
      </div>
    </div>
  )
}
