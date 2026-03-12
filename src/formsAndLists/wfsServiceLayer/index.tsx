import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { WfsServiceLayerForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import type WfsServiceLayers from '../../models/public/WfsServiceLayers.ts'

import '../../form.css'

const from =
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/$wfsServiceLayerId/'

export const WfsServiceLayer = () => {
  const { wfsServiceLayerId } = useParams({ from })
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT * FROM wfs_service_layers WHERE wfs_service_layer_id = $1`,
    [wfsServiceLayerId],
  )
  const row: WfsServiceLayers | undefined = res?.rows?.[0]

  if (row === undefined) return <Loading />
  if (row === null)
    return (
      <NotFound
        table={formatMessage({ id: 'Cb1DcE', defaultMessage: 'WFS-Dienst-Ebene' })}
        id={wfsServiceLayerId}
      />
    )

  return (
    <div className="form-outer-container">
      <Header />
      <div className="form-container">
        <Form row={row} />
      </div>
    </div>
  )
}
