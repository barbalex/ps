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
    // if name fields changed, need to update the label of corresponding vector layers
    if (
      row &&
      [
        'name_plural_de', 'name_plural_en', 'name_plural_fr', 'name_plural_it',
        'name_singular_de', 'name_singular_en', 'name_singular_fr', 'name_singular_it',
        'actions',
        'checks',
        'observations',
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
          validationState={validations?.level?.state}
          validationMessage={validations?.level?.message}
        />
        <TextField
          label="Name in German (singular)"
          name="name_singular_de"
          value={row.name_singular_de ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.name_singular_de?.state}
          validationMessage={validations?.name_singular_de?.message}
        />
        <TextField
          label="Name in German (plural)"
          name="name_plural_de"
          value={row.name_plural_de ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_de?.state}
          validationMessage={validations?.name_plural_de?.message}
        />
        <TextField
          label="Name in German (short)"
          name="name_short_de"
          value={row.name_short_de ?? ''}
          onChange={onChange}
          validationState={validations?.name_short_de?.state}
          validationMessage={validations?.name_short_de?.message}
        />
        <TextField
          label="Name in English (singular)"
          name="name_singular_en"
          value={row.name_singular_en ?? ''}
          onChange={onChange}
          validationState={validations?.name_singular_en?.state}
          validationMessage={validations?.name_singular_en?.message}
        />
        <TextField
          label="Name in English (plural)"
          name="name_plural_en"
          value={row.name_plural_en ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_en?.state}
          validationMessage={validations?.name_plural_en?.message}
        />
        <TextField
          label="Name in English (short)"
          name="name_short_en"
          value={row.name_short_en ?? ''}
          onChange={onChange}
          validationState={validations?.name_short_en?.state}
          validationMessage={validations?.name_short_en?.message}
        />
        <TextField
          label="Name in French (singular)"
          name="name_singular_fr"
          value={row.name_singular_fr ?? ''}
          onChange={onChange}
          validationState={validations?.name_singular_fr?.state}
          validationMessage={validations?.name_singular_fr?.message}
        />
        <TextField
          label="Name in French (plural)"
          name="name_plural_fr"
          value={row.name_plural_fr ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_fr?.state}
          validationMessage={validations?.name_plural_fr?.message}
        />
        <TextField
          label="Name in French (short)"
          name="name_short_fr"
          value={row.name_short_fr ?? ''}
          onChange={onChange}
          validationState={validations?.name_short_fr?.state}
          validationMessage={validations?.name_short_fr?.message}
        />
        <TextField
          label="Name in Italian (singular)"
          name="name_singular_it"
          value={row.name_singular_it ?? ''}
          onChange={onChange}
          validationState={validations?.name_singular_it?.state}
          validationMessage={validations?.name_singular_it?.message}
        />
        <TextField
          label="Name in Italian (plural)"
          name="name_plural_it"
          value={row.name_plural_it ?? ''}
          onChange={onChange}
          validationState={validations?.name_plural_it?.state}
          validationMessage={validations?.name_plural_it?.message}
        />
        <TextField
          label="Name in Italian (short)"
          name="name_short_it"
          value={row.name_short_it ?? ''}
          onChange={onChange}
          validationState={validations?.name_short_it?.state}
          validationMessage={validations?.name_short_it?.message}
        />
        <SwitchField
          label="Enable reports"
          name="reports"
          value={row.reports ?? false}
          onChange={onChange}
          validationState={validations?.reports?.state}
          validationMessage={validations?.reports?.message}
        />
        <SwitchField
          label="Enable report values"
          name="report_values"
          value={row.report_values ?? false}
          onChange={onChange}
          validationState={validations?.report_values?.state}
          validationMessage={validations?.report_values?.message}
        />
        <SwitchField
          label="Enable actions"
          name="actions"
          value={row.actions ?? false}
          onChange={onChange}
          validationState={validations?.actions?.state}
          validationMessage={validations?.actions?.message}
        />
        <SwitchField
          label="Enable action values"
          name="action_values"
          value={row.action_values ?? false}
          onChange={onChange}
          validationState={validations?.action_values?.state}
          validationMessage={validations?.action_values?.message}
        />
        <SwitchField
          label="Enable action reports"
          name="action_reports"
          value={row.action_reports ?? false}
          onChange={onChange}
          validationState={validations?.action_reports?.state}
          validationMessage={validations?.action_reports?.message}
        />
        <SwitchField
          label="Enable checks"
          name="checks"
          value={row.checks ?? false}
          onChange={onChange}
          validationState={validations?.checks?.state}
          validationMessage={validations?.checks?.message}
        />
        <SwitchField
          label="Enable check values"
          name="check_values"
          value={row.check_values ?? false}
          onChange={onChange}
          validationState={validations?.check_values?.state}
          validationMessage={validations?.check_values?.message}
        />
        <SwitchField
          label="Enable check taxa"
          name="check_taxa"
          value={row.check_taxa ?? false}
          onChange={onChange}
          validationState={validations?.check_taxa?.state}
          validationMessage={validations?.check_taxa?.message}
        />
        <SwitchField
          label="Enable observations"
          name="observations"
          value={row.observations ?? false}
          onChange={onChange}
          validationState={validations?.observations?.state}
          validationMessage={validations?.observations?.message}
        />
      </div>
    </div>
  )
}
