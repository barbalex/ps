import { useRef, useCallback, memo } from 'react'
import { useParams, useSearch } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Header } from './Header.tsx'
import { PlaceForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'

import '../../form.css'

const fieldsStyle = { padding: 10 }

export const Place = memo(({ from }) => {
  const { placeId, placeId2 } = useParams({ from })
  const { onlyForm } = useSearch({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM places WHERE place_id = $1`,
    [placeId2 ?? placeId],
    'place_id',
  )
  const row = res?.rows?.[0]

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

  if (!row) return <Loading />

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
