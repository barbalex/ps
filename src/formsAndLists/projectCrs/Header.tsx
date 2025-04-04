import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectCrs } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/_authLayout/projects/$projectId_/crs/$projectCrsId/'

export const Header = memo(({ autoFocusRef }) => {
  const { projectId, projectCrsId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createProjectCrs({ projectId, db })
    const projectCrs = res?.rows?.[0]
    navigate({
      to: `../${projectCrs.project_crs_id}`,
      params: (prev) => ({ ...prev, projectCrsId: projectCrs.project_crs_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM project_crs WHERE project_crs_id = $1`, [
      projectCrsId,
    ])
    navigate({ to: '..' })
  }, [db, navigate, projectCrsId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT project_crs_id FROM project_crs WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const projectCrs = res?.rows
    const len = projectCrs.length
    const index = projectCrs.findIndex((p) => p.project_crs_id === projectCrsId)
    const next = projectCrs[(index + 1) % len]
    navigate({
      to: `../${next.project_crs_id}`,
      params: (prev) => ({ ...prev, projectCrsId: next.project_crs_id }),
    })
  }, [db, navigate, projectCrsId, projectId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT project_crs_id FROM project_crs WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const projectCrs = res?.rows
    const len = projectCrs.length
    const index = projectCrs.findIndex((p) => p.project_crs_id === projectCrsId)
    const previous = projectCrs[(index + len - 1) % len]
    navigate({
      to: `../${previous.project_crs_id}`,
      params: (prev) => ({ ...prev, projectCrsId: previous.project_crs_id }),
    })
  }, [db, navigate, projectCrsId, projectId])

  return (
    <FormHeader
      title="CRS"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="project_crs"
    />
  )
})
