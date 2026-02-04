import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { WmsServiceForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import type WmsServices from '../../models/public/WmsServices.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/wms-services/$wmsServiceId/'

export const WmsService = () => {
  const { wmsServiceId } = useParams({ from })

  const res = useLiveQuery(`SELECT * FROM wms_services WHERE wms_service_id = $1`, [
    wmsServiceId,
  ])
  const row: WmsServices | undefined = res?.rows?.[0]

  if (row === undefined) return <Loading />
  if (row === null) return <NotFound table="WMS Service" id={wmsServiceId} />

  return (
    <div className="form-outer-container">
      <Header />
      <div className="form-container">
        <Form row={row} />
      </div>
    </div>
  )
}
