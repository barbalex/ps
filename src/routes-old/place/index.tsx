import { useRef, useCallback, memo } from 'react'
import { useSearchParams, useParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Header } from './Header.tsx'
import { Component as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'

import '../../form.css'

const fieldsStyle = { padding: 10 }

export const Component = memo(() => {
  const { place_id, place_id2 } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM places WHERE place_id = $1`,
    [place_id2 ?? place_id],
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
        place_id,
      ])
    },
    [db, place_id, row],
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
      <Header autoFocusRef={autoFocusRef} />
      <div style={fieldsStyle}></div>
      <Form
        row={row}
        onChange={onChange}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )
})
