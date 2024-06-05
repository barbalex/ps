import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { VectorLayerForm } from './Form/index.tsx'

import '../../form.css'

export const Component = () => {
  const { vector_layer_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.vector_layers.liveUnique({ where: { vector_layer_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.vector_layers.update({
        where: { vector_layer_id },
        data: { [name]: value },
      })
    },
    [db.vector_layers, vector_layer_id],
  )

  if (!row) return <Loading />

  // console.log('hello VectorLayerForm, row:', row)

  return (
    <div className="form-outer-container">
      <Header row={row} autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="vector_layer_id"
          value={row.vector_layer_id}
        />
        <VectorLayerForm
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
        />
      </div>
    </div>
  )
}
