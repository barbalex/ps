import { useRef, useCallback, memo } from 'react'
import { useParams, useSearch } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { Header } from './Header.tsx'
import { PlaceForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

const fieldsStyle = { padding: 10 }

export const Place = memo(({ from }) => {
  const { projectId, placeId, placeId2 } = useParams({ from })
  const { onlyForm } = useSearch({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `
    SELECT 
      *
    FROM
      places
    WHERE place_id = $1`,
    [placeId2 ?? placeId],
  )
  const row = res?.rows?.[0]

  const nameRes = useLiveQuery(
    `
    SELECT 
      place_level_id, 
      name_singular, 
      name_plural 
    FROM place_levels 
    WHERE 
      project_id = $1 
      AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevels = nameRes?.rows ?? []
  const nameSingular = placeLevels?.[0]?.name_singular ?? 'Place'
  const namePlural = placeLevels?.[0]?.name_plural ?? 'Places'

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(`UPDATE places SET ${name} = $1 WHERE place_id = $2`, [
        value,
        placeId,
      ])
    },
    [db, placeId, row],
  )

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={nameSingular}
        id={placeId2 ?? placeId}
      />
    )
  }

  if (onlyForm) {
    return (
      <Form
        row={row}
        onChange={onChange}
        autoFocusRef={autoFocusRef}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
        nameSingular={nameSingular}
        namePlural={namePlural}
      />
      <div style={fieldsStyle}></div>
      <Form
        row={row}
        onChange={onChange}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )
})
