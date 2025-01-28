import { useRef, useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useSearchParams, useParams } from 'react-router-dom'

import { Header } from './Header.tsx'
import { Component as Form } from './Form.tsx'
import { useElectric } from '../../ElectricProvider.tsx'
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
  const { results: row } = useLiveQuery(
    db.places.liveUnique({ where: { place_id: place_id2 ?? place_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)

      db.places.update({
        where: { place_id },
        data: { [name]: value },
      })
    },
    [db.places, place_id],
  )

  if (!row) return <Loading />

  if (onlyForm) {
    return <Form row={row} onChange={onChange} autoFocusRef={autoFocusRef} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div style={fieldsStyle}>
        <TextFieldInactive label="ID" name="place_id" value={row.place_id} />
      </div>
      <Form row={row} onChange={onChange} autoFocusRef={autoFocusRef} />
    </div>
  )
})
