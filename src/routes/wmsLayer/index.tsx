import { useCallback, useRef, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Component as Form } from './Form/index.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { wms_layer_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const { results: wmsLayer } = useLiveQuery(
    db.wms_layers.liveUnique({
      where: { wms_layer_id },
      include: { wms_services: true },
    }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      try {
        await db.wms_layers.update({
          where: { wms_layer_id },
          data: { [name]: value },
        })
      } catch (error) {
        console.log('hello WmsLayer, onChange, error:', error)
      }
      // TODO:
      // 1. if name is wms_layer, need to set queryable, legend_url, more?
      // 2. use wms_layers.queryable in the click listener for the info drawer
      return
    },
    [db, wms_layer_id],
  )

  // console.log('WmsLayer, row:', wmsLayer)

  if (!wmsLayer) return <Loading />

  // console.log('hello WmsLayer, row:', row)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form
          onChange={onChange}
          wmsLayer={wmsLayer}
          autoFocusRef={autoFocusRef}
        />
      </div>
    </div>
  )
})
