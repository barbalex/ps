import { useRef, useState } from 'react'
import { useParams, useSearch } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'

import { Header } from './Header.tsx'
import { PlaceForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom, languageAtom } from '../../store.ts'
import type Places from '../../models/public/Places.ts'

import '../../form.css'

export const Place = ({ from }) => {
  const { projectId, placeId, placeId2 } = useParams({ from })
  const { onlyForm } = useSearch({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [language] = useAtom(languageAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const currentPlaceId = placeId2 ?? placeId

  const db = usePGlite()
  const res = useLiveQuery(
    `
    SELECT 
      *
    FROM
      places
    WHERE place_id = $1`,
    [currentPlaceId],
  )
  const row: Places | undefined = res?.rows?.[0]

  const nameRes = useLiveQuery(
    `
    SELECT 
      place_level_id, 
      name_singular_${language}, 
      name_plural_${language} 
    FROM place_levels 
    WHERE 
      project_id = $1 
      AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevels = nameRes?.rows ?? []
  const nameSingular =
    placeLevels?.[0]?.[`name_singular_${language}`] ?? 'Place'
  const namePlural = placeLevels?.[0]?.[`name_plural_${language}`] ?? 'Places'

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(`UPDATE places SET ${name} = $1 WHERE place_id = $2`, [
        value,
        currentPlaceId,
      ])
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
      table: 'places',
      rowIdName: 'place_id',
      rowId: currentPlaceId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table={nameSingular} id={placeId2 ?? placeId} />
  }

  if (onlyForm) {
    return (
      <Form
        row={row}
        onChange={onChange}
        validations={validations}
        autoFocusRef={autoFocusRef}
        from={from}
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
      <Form
        row={row}
        onChange={onChange}
        validations={validations}
        autoFocusRef={autoFocusRef}
        from={from}
      />
    </div>
  )
}
