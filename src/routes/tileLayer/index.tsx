import { useCallback, useRef, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as Form } from './Form.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { tile_layer_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.tile_layers.liveUnique({ where: { tile_layer_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      try {
        await db.tile_layers.update({
          where: { tile_layer_id },
          data: { [name]: value },
        })
      } catch (error) {
        console.log('hello TileLayer, onChange, error:', error)
      }
      // TODO:
      // 1. if name is wms_layer, need to set tile_layers.queryable to layer_options.queryable of the wms_layer field
      // 2. use tile_layers.queryable in the click listener for the info drawer
      return
    },
    [db, tile_layer_id],
  )

  if (!row) return <Loading />

  // console.log('hello TileLayer, row:', row)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form onChange={onChange} row={row} autoFocusRef={autoFocusRef} />
      </div>
    </div>
  )
})
