import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createWfsService } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
  from: string
}

export const Header = ({ autoFocusRef, from }: Props) => {
  const isForm =
    from ===
    '/data/projects/$projectId_/wfs-services/$wfsServiceId_/wfs-service'
  const { projectId, wfsServiceId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM wfs_services WHERE project_id = '${projectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const res = useLiveQuery(
    `
      SELECT * FROM wfs_services
      WHERE project_id = $1
      ORDER BY url, wfs_service_id
    `,
    [projectId],
  )
  const rows = res?.rows ?? []
  const len = rows.length
  const ownIndex = rows.findIndex((row) => row.wfs_service_id === wfsServiceId)

  const addRow = async () => {
    const id = await createWfsService({ projectId })
    if (!id) return
    navigate({
      to: isForm ? `../../${id}/wfs-service` : `../${id}/wfs-service`,
      params: (prev) => ({ ...prev, wfsServiceId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM wfs_services WHERE wfs_service_id = $1`,
        [wfsServiceId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM wfs_services WHERE wfs_service_id = $1`, [
        wfsServiceId,
      ])
      addOperation({
        table: 'wfs_services',
        rowIdName: 'wfs_service_id',
        rowId: wfsServiceId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = () => {
    const next = rows[(ownIndex + 1) % len]
    if (!next) return
    navigate({
      to:
        isForm ?
          `../../${next.wfs_service_id}/wfs-service`
        : `../${next.wfs_service_id}/wfs-service`,
      params: (prev) => ({ ...prev, wfsServiceId: next.wfs_service_id }),
    })
  }

  const toPrevious = () => {
    const previous = rows[(ownIndex + len - 1) % len]
    if (!previous) return
    navigate({
      to:
        isForm ?
          `../../${previous.wfs_service_id}/wfs-service`
        : `../${previous.wfs_service_id}/wfs-service`,
      params: (prev) => ({ ...prev, wfsServiceId: previous.wfs_service_id }),
    })
  }

  return (
    <FormHeader
      title="WFS Service"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="wfs service"
    />
  )
}
