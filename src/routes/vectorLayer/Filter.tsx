import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { VectorLayerForm } from './Form/index.tsx'

import '../../form.css'

export const Component = () => {
  const { vector_layer_id } = useParams()

  const { db } = useElectric()!
  // TODO: load from app_state[filter_field] instead
  const { results: row } = useLiveQuery(
    db.vector_layers.liveUnique({ where: { vector_layer_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // TODO: update app_state[filter_field] instead
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
      {/* TODO: need filter header */}
      <Header row={row} />
      {/* TODO: make filtering obvious */}
      <div className="form-container">
        {/* TODO: enable or filtering? */}
        <VectorLayerForm onChange={onChange} row={row} />
      </div>
    </div>
  )
}
