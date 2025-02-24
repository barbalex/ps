import { useRef, useCallback, memo } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { Header } from './Header.tsx'
import { Component as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'

import '../../form.css'

const fieldsStyle = { padding: 10 }

export const Component = memo(() => {
  const { place_id, place_id2 } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM places WHERE place_id = $1`, [
    place_id2 ?? place_id,
  ])
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.query(`UPDATE places SET ${name} = $1 WHERE place_id = $2`, [
        value,
        place_id,
      ])
    },
    [db, place_id],
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
      <div style={fieldsStyle}>
        <TextFieldInactive
          label="ID"
          name="place_id"
          value={row.place_id}
        />
      </div>
      <Form
        row={row}
        onChange={onChange}
        autoFocusRef={autoFocusRef}
      />
    </div>
  )
})
