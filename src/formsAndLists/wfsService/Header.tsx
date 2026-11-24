import { useParams, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { createWfsService } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'

interface Props {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  from: string
  label?: string
}

export const Header = ({ autoFocusRef, from }: Props) => {
  const isForm =
    from ===
    '/data/projects/$projectId_/wfs-services/$wfsServiceId_/wfs-service'
  const { projectId, wfsServiceId } = useParams({ strict: false })
  const basePath = `/data/projects/${projectId}/wfs-services/${wfsServiceId}`
  const navigate = useNavigate()
  const requestDelete = useRequestRowDelete()
  const { formatMessage } = useIntl()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM wfs_services WHERE project_id = '${projectId}'`,
  )
  const rowCount = Number(countRes?.rows?.[0]?.count ?? 2)

  const res = useLiveQuery(
    `
      SELECT * FROM wfs_services
      WHERE project_id = $1
      ORDER BY url, wfs_service_id
    `,
    [projectId],
  )
  const rows = (res?.rows ?? []) as { wfs_service_id: string }[]
  const len = rows.length
  const ownIndex = rows.findIndex((row) => row.wfs_service_id === wfsServiceId)

  const addRow = async () => {
    const data = await createWfsService({ projectId })
    if (!data) return
    const id = data.wfs_service_id
    navigate({
      to: isForm ? `../../${id}/wfs-service` : `../${id}/wfs-service`,
      params: (prev) => ({ ...prev, wfsServiceId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'wfs_services',
      rowIdName: 'wfs_service_id',
      rowId: wfsServiceId!,
      navigateTo: isForm ? ('../..' as '..') : '..',
    })

  const toNext = () => {
    const next = rows[(ownIndex + 1) % len]
    if (!next) return
    navigate({
      to: isForm
        ? `../../${next.wfs_service_id}/wfs-service`
        : `../${next.wfs_service_id}/wfs-service`,
      params: (prev) => ({ ...prev, wfsServiceId: next.wfs_service_id }),
    })
  }

  const toPrevious = () => {
    const previous = rows[(ownIndex + len - 1) % len]
    if (!previous) return
    navigate({
      to: isForm
        ? `../../${previous.wfs_service_id}/wfs-service`
        : `../${previous.wfs_service_id}/wfs-service`,
      params: (prev) => ({ ...prev, wfsServiceId: previous.wfs_service_id }),
    })
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'X88JDr', defaultMessage: 'WFS-Dienst' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="wfs service"
      siblings={
        isForm ? (
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={`${basePath}/wfs-service`}
            historyTable="wfs_services_history"
            rowIdField="wfs_service_id"
            rowId={wfsServiceId}
          />
        ) : undefined
      }
    />
  )
}
