import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubproject } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId/'

export const Header = memo(({ autoFocusRef, nameSingular = 'Subproject' }) => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const nameSingularLower = nameSingular?.toLowerCase?.()

  const addRow = useCallback(async () => {
    const res = await createSubproject({ db, projectId })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.subproject_id}`,
      params: (prev) => ({
        ...prev,
        subprojectId: data.subproject_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM subprojects WHERE subproject_id = $1`, [
      subprojectId,
    ])
    navigate({ to: '..' })
  }, [db, subprojectId, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT subproject_id FROM subprojects WHERE project_id = $1 order by label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.subproject_id === subprojectId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `../${next.subproject_id}`,
      params: (prev) => ({
        ...prev,
        subprojectId: next.subproject_id,
      }),
    })
  }, [db, projectId, navigate, subprojectId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT subproject_id FROM subprojects WHERE project_id = $1 order by label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.subproject_id === subprojectId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `../${previous.subproject_id}`,
      params: (prev) => ({
        ...prev,
        subprojectId: previous.subproject_id,
      }),
    })
  }, [db, projectId, navigate, subprojectId])

  return (
    <FormHeader
      title={nameSingular}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName={nameSingularLower}
    />
  )
})
