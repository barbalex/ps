import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { WmsServiceLayerForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import type WmsServiceLayers from '../../models/public/WmsServiceLayers.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/wms-services/$wmsServiceId/layers/$wmsServiceLayerId/'

export const WmsServiceLayer = () => {
  const { wmsServiceLayerId } = useParams({ from })

  const res = useLiveQuery(`SELECT * FROM wms_service_layers WHERE wms_service_layer_id = $1`, [
    wmsServiceLayerId,
  ])
  const row: WmsServiceLayers | undefined = res?.rows?.[0]

  if (row === undefined) return <Loading />
  if (row === null) return <NotFound table="WMS Service Layer" id={wmsServiceLayerId} />

  return (
    <div className="form-outer-container">
      <Header />
      <div className="form-container">
        <Form row={row} />
      </div>
    </div>
  )
}
