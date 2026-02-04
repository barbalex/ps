import { useParams, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/projects/$projectId_/wms-services/$wmsServiceId/'

export const Header = () => {
  const { projectId, wmsServiceId } = useParams({ from })
  const navigate = useNavigate()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM wms_services WHERE project_id = '${projectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const res = useLiveQuery(
    `
      SELECT * FROM wms_services
      WHERE project_id = $1
      ORDER BY url, wms_service_id
    `,
    [projectId],
  )
  const rows = res?.rows ?? []
  const len = rows.length
  const ownIndex = rows.findIndex((row) => row.wms_service_id === wmsServiceId)

  const toNext = () => {
    const next = rows[(ownIndex + 1) % len]
    if (!next) return
    navigate({
      to: `../${next.wms_service_id}`,
      params: (prev) => ({ ...prev, wmsServiceId: next.wms_service_id }),
    })
  }

  const toPrevious = () => {
    const previous = rows[(ownIndex + len - 1) % len]
    if (!previous) return
    navigate({
      to: `../${previous.wms_service_id}`,
      params: (prev) => ({ ...prev, wmsServiceId: previous.wms_service_id }),
    })
  }

  return (
    <FormHeader
      title="WMS Service"
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="wms service"
    />
  )
}
