import { useRef, useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useSearchParams, useParams } from 'react-router-dom'

import { Header } from './Header.tsx'
import { Component as Form } from './Form.tsx'
import { useElectric } from '../../ElectricProvider.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { place_id, place_id2 } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.places.liveUnique({ where: { place_id: place_id2 ?? place_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      const valueToUse = name === 'level' ? +value : value

      db.places.update({
        where: { place_id },
        data: { [name]: valueToUse },
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
      <TextFieldInactive label="ID" name="place_id" value={row.place_id} />
      <Form row={row} onChange={onChange} autoFocusRef={autoFocusRef} />
    </div>
  )
})
