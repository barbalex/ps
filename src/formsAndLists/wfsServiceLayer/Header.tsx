import { useParams, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'

const from =
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/$wfsServiceLayerId/'

export const Header = () => {
  const { projectId, wfsServiceId, wfsServiceLayerId } = useParams({ from })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const basePath = `/data/projects/${projectId}/wfs-services/${wfsServiceId}/layers/${wfsServiceLayerId}`

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM wfs_service_layers WHERE wfs_service_id = $1`,
    [wfsServiceId],
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const res = useLiveQuery(
    `
      SELECT * FROM wfs_service_layers
      WHERE wfs_service_id = $1
      ORDER BY label, wfs_service_layer_id
    `,
    [wfsServiceId],
  )
  const rows = res?.rows ?? []
  const len = rows.length
  const ownIndex = rows.findIndex(
    (row) => row.wfs_service_layer_id === wfsServiceLayerId,
  )

  const toNext = () => {
    const next = rows[(ownIndex + 1) % len]
    if (!next) return
    navigate({
      to: `../${next.wfs_service_layer_id}`,
      params: (prev) => ({
        ...prev,
        wfsServiceLayerId: next.wfs_service_layer_id,
      }),
    })
  }

  const toPrevious = () => {
    const previous = rows[(ownIndex + len - 1) % len]
    if (!previous) return
    navigate({
      to: `../${previous.wfs_service_layer_id}`,
      params: (prev) => ({
        ...prev,
        wfsServiceLayerId: previous.wfs_service_layer_id,
      }),
    })
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'Cb1DcE', defaultMessage: 'WFS-Dienst-Ebene' })}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="wfs service layer"
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="wfs_service_layers_history"
          rowIdField="wfs_service_layer_id"
          rowId={wfsServiceLayerId}
        />
      }
    />
  )
}
