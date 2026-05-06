import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createProjectExport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/exports/$projectExportsId/'

export const Header = ({ autoFocusRef }) => {
  const { projectId, projectExportsId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  const projectExportsIdRef = useRef(projectExportsId)
  useEffect(() => {
    projectExportsIdRef.current = projectExportsId
  }, [projectExportsId])

  const addRow = async () => {
    const id = await createProjectExport({ projectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, projectExportsId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM project_exports WHERE project_exports_id = $1`,
        [projectExportsId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM project_exports WHERE project_exports_id = $1`, [projectExportsId])
      addOperation({
        table: 'project_exports',
        rowIdName: 'project_exports_id',
        rowId: projectExportsId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting project export:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT project_exports_id
         FROM project_exports
         WHERE project_id = $1
         ORDER BY COALESCE(NULLIF(name_de, ''), project_exports_id::text)`,
        [projectId],
      )
      const rows = res?.rows ?? []
      const len = rows.length
      if (!len) return
      const index = rows.findIndex(
        (p) => p.project_exports_id === projectExportsIdRef.current,
      )
      const next = rows[(index + 1) % len]
      navigate({
        to: `../${next.project_exports_id}`,
        params: (prev) => ({ ...prev, projectExportsId: next.project_exports_id }),
      })
    } catch (error) {
      console.error('Error navigating to next project export:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT project_exports_id
         FROM project_exports
         WHERE project_id = $1
         ORDER BY COALESCE(NULLIF(name_de, ''), project_exports_id::text)`,
        [projectId],
      )
      const rows = res?.rows ?? []
      const len = rows.length
      if (!len) return
      const index = rows.findIndex(
        (p) => p.project_exports_id === projectExportsIdRef.current,
      )
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `../${previous.project_exports_id}`,
        params: (prev) => ({
          ...prev,
          projectExportsId: previous.project_exports_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous project export:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({
        id: 'exports.nameSingular',
        defaultMessage: 'Export',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="projectExport"
    />
  )
}
