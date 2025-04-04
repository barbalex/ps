import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/_authLayout/projects/$projectId_/users/$projectUserId/'

export const Header = memo(({ autoFocusRef }) => {
  const { projectId, projectUserId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const projectUser = await createProjectUser({ projectId, db })
    navigate({
      to: `../${projectUser.project_user_id}`,
      params: (prev) => ({
        ...prev,
        projectUserId: projectUser.project_user_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM project_users WHERE project_user_id = $1`, [
      projectUserId,
    ])
    navigate({ to: '..' })
  }, [db, navigate, projectUserId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT project_user_id FROM project_users WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const projectUsers = res?.rows
    const len = projectUsers.length
    const index = projectUsers.findIndex(
      (p) => p.project_user_id === projectUserId,
    )
    const next = projectUsers[(index + 1) % len]
    navigate({
      to: `../${next.project_user_id}`,
      params: (prev) => ({
        ...prev,
        projectUserId: next.project_user_id,
      }),
    })
  }, [db, navigate, projectId, projectUserId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT project_user_id FROM project_users WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const projectUsers = res?.rows
    const len = projectUsers.length
    const index = projectUsers.findIndex(
      (p) => p.project_user_id === projectUserId,
    )
    const previous = projectUsers[(index + len - 1) % len]
    navigate({
      to: `../${previous.project_user_id}`,
      params: (prev) => ({
        ...prev,
        projectUserId: previous.project_user_id,
      }),
    })
  }, [db, navigate, projectId, projectUserId])

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
