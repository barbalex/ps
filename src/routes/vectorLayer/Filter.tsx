import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { VectorLayerForm } from './Form/index.tsx'
import { FilterHeader } from '../../components/shared/FilterHeader.tsx'

import '../../form.css'

export const Component = () => {
  const { vector_layer_id } = useParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  // TODO: load from app_state[filter_field] instead
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
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

  if (!appState) return <Loading />

  // console.log('hello VectorLayerForm, row:', row)

  return (
    <div className="form-outer-container">
      {/* TODO: need filter header */}
      <FilterHeader title="Vector Layer Filter" />
      {/* TODO: make filtering obvious */}
      <div className="form-container">
        {/* TODO: enable or filtering? */}
        <VectorLayerForm onChange={onChange} row={{ tod: 'TODO:' }} />
      </div>
    </div>
  )
}