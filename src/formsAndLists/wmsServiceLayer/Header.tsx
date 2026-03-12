import { useParams, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId/'

export const Header = () => {
  const { formatMessage } = useIntl()
  const { wmsServiceId, wmsServiceLayerId } = useParams({ from })
  const navigate = useNavigate()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM wms_service_layers WHERE wms_service_id = $1`,
    [wmsServiceId],
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const res = useLiveQuery(
    `
      SELECT * FROM wms_service_layers
      WHERE wms_service_id = $1
      ORDER BY label, wms_service_layer_id
    `,
    [wmsServiceId],
  )
  const rows = res?.rows ?? []
  const len = rows.length
  const ownIndex = rows.findIndex((row) => row.wms_service_layer_id === wmsServiceLayerId)

  const toNext = () => {
    const next = rows[(ownIndex + 1) % len]
    if (!next) return
    navigate({
      to: `../${next.wms_service_layer_id}`,
      params: (prev) => ({ ...prev, wmsServiceLayerId: next.wms_service_layer_id }),
    })
  }

  const toPrevious = () => {
    const previous = rows[(ownIndex + len - 1) % len]
    if (!previous) return
    navigate({
      to: `../${previous.wms_service_layer_id}`,
      params: (prev) => ({ ...prev, wmsServiceLayerId: previous.wms_service_layer_id }),
    })
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'Mn1OpQ', defaultMessage: 'WMS-Dienst-Ebene' })}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="wms service layer"
    />
  )
}
