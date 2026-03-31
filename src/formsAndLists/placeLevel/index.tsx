import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { PlaceLevelForm } from './Form.tsx'
import { updateTableVectorLayerLabels } from '../../modules/updateTableVectorLayerLabels.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom, designingAtom } from '../../store.ts'
import type PlaceLevels from '../../models/public/PlaceLevels.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/place-levels/$placeLevelId/'

export const PlaceLevel = () => {
  const { placeLevelId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  useAtom(designingAtom)
  const { formatMessage } = useIntl()

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
        'name_plural_de',
        'name_plural_en',
        'name_plural_fr',
        'name_plural_it',
        'name_singular_de',
        'name_singular_en',
        'name_singular_fr',
        'name_singular_it',
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
    return (
      <NotFound
        table={formatMessage({ id: 'Lf+2pw', defaultMessage: 'Ort-Stufe' })}
        id={placeLevelId}
      />
    )
  }

  // console.log('place level', row)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <PlaceLevelForm
          row={row}
          onChange={onChange}
          validations={validations}
          autoFocusRef={autoFocusRef}
        />
      </div>
    </div>
  )
}
