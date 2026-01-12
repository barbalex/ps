import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { WmsLayerForm as Form } from './Form/index.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

import type WmsLayers from '../../models/public/WmsLayers.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/wms-layers/$wmsLayerId'

export const WmsLayer = () => {
  const { wmsLayerId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM wms_layers WHERE wms_layer_id = $1`, [
    wmsLayerId,
  ])
  const row: WmsLayers | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE wms_layers SET ${name} = $1 WHERE wms_layer_id = $2`,
        [value, wmsLayerId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'wms_layers',
      rowIdName: 'wms_layer_id',
      rowId: wmsLayerId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
    // TODO:
    // 1. if name is wms_layer, need to set queryable, legend_url, more?
    // 2. use wms_layers.queryable in the click listener for the info drawer
    return
  }

  // console.log('WmsLayer, row:', wmsLayer)

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="WMS Layer" id={wmsLayerId} />
  }

  // console.log('hello WmsLayer, row:', row)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form onChange={onChange} validations={validations} row={row} autoFocusRef={autoFocusRef} />
      </div>
    </div>
  )
}
