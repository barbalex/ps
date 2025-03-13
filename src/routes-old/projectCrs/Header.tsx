import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectCrs } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, project_crs_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createProjectCrs({ project_id, db })
    const projectCrs = res?.rows?.[0]
    navigate({
      pathname: `../${projectCrs.project_crs_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM project_crs WHERE project_crs_id = $1`, [
      project_crs_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, project_crs_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT project_crs_id FROM project_crs WHERE project_id = $1 ORDER BY label`,
      [project_id],
    )
    const projectCrs = res?.rows
    const len = projectCrs.length
    const index = projectCrs.findIndex(
      (p) => p.project_crs_id === project_crs_id,
    )
    const next = projectCrs[(index + 1) % len]
    navigate({
      pathname: `../${next.project_crs_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_crs_id, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT project_crs_id FROM project_crs WHERE project_id = $1 ORDER BY label`,
      [project_id],
    )
    const projectCrs = res?.rows
    const len = projectCrs.length
    const index = projectCrs.findIndex(
      (p) => p.project_crs_id === project_crs_id,
    )
    const previous = projectCrs[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.project_crs_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_crs_id, project_id, searchParams])

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
