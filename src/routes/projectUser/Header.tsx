import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, project_user_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const projectUser = await createProjectUser({ project_id, db })
    navigate({
      pathname: `../${projectUser.project_user_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM project_users WHERE project_user_id = $1`, [
      project_user_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, project_user_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT project_user_id FROM project_users WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const projectUsers = res.rows
    const len = projectUsers.length
    const index = projectUsers.findIndex(
      (p) => p.project_user_id === project_user_id,
    )
    const next = projectUsers[(index + 1) % len]
    navigate({
      pathname: `../${next.project_user_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, project_user_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT project_user_id FROM project_users WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const projectUsers = res.rows
    const len = projectUsers.length
    const index = projectUsers.findIndex(
      (p) => p.project_user_id === project_user_id,
    )
    const previous = projectUsers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.project_user_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, project_user_id, searchParams])

  return (
    <FormHeader
      title="Project User"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="project user"
    />
  )
})
