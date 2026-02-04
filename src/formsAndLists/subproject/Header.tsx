import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createSubproject } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, nameSingular = 'Subproject', from }) => {
  const isForm =
    from === '/data/projects/$projectId_/subprojects/$subprojectId_/subproject'
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM subprojects WHERE project_id = '${projectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const nameSingularLower = nameSingular?.toLowerCase?.()

  const addRow = async () => {
    const subprojectId = await createSubproject({ projectId })
    navigate({
      to:
        isForm ?
          `../../${subprojectId}/subproject`
        : `../${subprojectId}/subproject`,
      params: (prev) => ({
        ...prev,
        subprojectId,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM subprojects WHERE subproject_id = $1`,
        [subprojectId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM subprojects WHERE subproject_id = $1`, [
        subprojectId,
      ])
      addOperation({
        table: 'subprojects',
        rowIdName: 'subproject_id',
        rowId: subprojectId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error('Error deleting subproject:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_id FROM subprojects WHERE project_id = $1 order by label`,
        [projectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.subproject_id === subprojectId)
      const next = rows[(index + 1) % len]
      navigate({
        to:
          isForm ?
            `../../${next.subproject_id}/subproject`
          : `../${next.subproject_id}`,
        params: (prev) => ({
          ...prev,
          subprojectId: next.subproject_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next subproject:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_id FROM subprojects WHERE project_id = $1 order by label`,
        [projectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.subproject_id === subprojectId)
      const previous = rows[(index + len - 1) % len]
      navigate({
        to:
          isForm ?
            `../../${previous.subproject_id}/subproject`
          : `../${previous.subproject_id}`,
        params: (prev) => ({
          ...prev,
          subprojectId: previous.subproject_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous subproject:', error)
    }
  }

  return (
    <FormHeader
      title={nameSingular}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName={nameSingularLower}
    />
  )
}
