import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createWmsService } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
  from: string
}

export const Header = ({ autoFocusRef, from }: Props) => {
  const isForm =
    from === '/data/projects/$projectId_/wms-services/$wmsServiceId_/wms-service'
  const { projectId, wmsServiceId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

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

  const addRow = async () => {
    const id = await createWmsService({ projectId })
    if (!id) return
    navigate({
      to: isForm ? `../../${id}/wms-service` : `../${id}/wms-service`,
      params: (prev) => ({ ...prev, wmsServiceId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM wms_services WHERE wms_service_id = $1`,
        [wmsServiceId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM wms_services WHERE wms_service_id = $1`, [wmsServiceId])
      addOperation({
        table: 'wms_services',
        rowIdName: 'wms_service_id',
        rowId: wmsServiceId,
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
      to: isForm ? `../../${next.wms_service_id}/wms-service` : `../${next.wms_service_id}/wms-service`,
      params: (prev) => ({ ...prev, wmsServiceId: next.wms_service_id }),
    })
  }

  const toPrevious = () => {
    const previous = rows[(ownIndex + len - 1) % len]
    if (!previous) return
    navigate({
      to: isForm ? `../../${previous.wms_service_id}/wms-service` : `../${previous.wms_service_id}/wms-service`,
      params: (prev) => ({ ...prev, wmsServiceId: previous.wms_service_id }),
    })
  }

  return (
    <FormHeader
      title="WMS Service"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="wms service"
    />
  )
}
