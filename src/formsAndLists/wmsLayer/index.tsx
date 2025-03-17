import { useCallback, useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { WmsLayerForm as Form } from './Form/index.tsx'

import '../../form.css'

const from = '/data/_authLayout/projects/$projectId_/wms-layers/$wmsLayerId'

export const WmsLayer = memo(() => {
  const { wmsLayerId } = useParams({ from })

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT * FROM wms_layers WHERE wms_layer_id = $1`,
    [wmsLayerId],
    'wms_layer_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      try {
        await db.query(
          `UPDATE wms_layers SET ${name} = $1 WHERE wms_layer_id = $2`,
          [value, wmsLayerId],
        )
      } catch (error) {
        console.log('hello WmsLayer, onChange, error:', error)
      }
      // TODO:
      // 1. if name is wms_layer, need to set queryable, legend_url, more?
      // 2. use wms_layers.queryable in the click listener for the info drawer
      return
    },
    [db, row, wmsLayerId],
  )

  // console.log('WmsLayer, row:', wmsLayer)

  if (!row) return <Loading />

  // console.log('hello WmsLayer, row:', row)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form
          onChange={onChange}
          wmsLayer={row}
          autoFocusRef={autoFocusRef}
        />
      </div>
    </div>
  )
})
