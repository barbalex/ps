import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'

import type PlaceHistories from '../../models/public/PlaceHistories.ts'

export const PlaceHistoryForm = ({ autoFocusRef }) => {
  const params = useParams({ strict: false })
  const { placeHistoryId, placeId2 } = params
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const from =
    placeId2 ?
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/histories/$placeHistoryId'
    : '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/histories/$placeHistoryId'

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM place_histories WHERE place_history_id = $1`,
    [placeHistoryId],
  )
  const row: PlaceHistories | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE place_histories SET ${name} = $1 WHERE place_history_id = $2`,
        [value, placeHistoryId],
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
      table: 'place_histories',
      rowIdName: 'place_history_id',
      rowId: row.place_history_id,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Place History"
        id={placeHistoryId}
      />
    )
  }

  return (
    <div className="form-container">
      <TextField
        label="Year"
        name="year"
        value={row.year ?? ''}
        type="number"
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.year?.state}
        validationMessage={validations?.year?.message}
      />
      <TextField
        label="Since"
        name="since"
        value={row.since ?? ''}
        type="number"
        onChange={onChange}
        validationState={validations?.since?.state}
        validationMessage={validations?.since?.message}
      />
      <TextField
        label="Until"
        name="until"
        value={row.until ?? ''}
        type="number"
        onChange={onChange}
        validationState={validations?.until?.state}
        validationMessage={validations?.until?.message}
      />
      <Jsonb
        table="place_histories"
        idField="place_history_id"
        id={row.place_history_id}
        data={row.data ?? {}}
        from={from}
      />
    </div>
  )
}
