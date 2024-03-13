import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createProjectUser } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, project_user_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `/projects/${project_id}/users`

  const addRow = useCallback(async () => {
    const projectUser = createProjectUser()
    await db.project_users.create({
      data: { ...projectUser, project_id },
    })
    navigate(`${baseUrl}/${projectUser.project_user_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db.project_users, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.project_users.delete({
      where: {
        project_user_id,
      },
    })
    navigate('..')
  }, [baseUrl, db.project_users, navigate, project_user_id])

  const toNext = useCallback(async () => {
    const projectUsers = await db.project_users.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectUsers.length
    const index = projectUsers.findIndex(
      (p) => p.project_user_id === project_user_id,
    )
    const next = projectUsers[(index + 1) % len]
    navigate(`${baseUrl}/${next.project_user_id}`)
  }, [baseUrl, db.project_users, navigate, project_id, project_user_id])

  const toPrevious = useCallback(async () => {
    const projectUsers = await db.project_users.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectUsers.length
    const index = projectUsers.findIndex(
      (p) => p.project_user_id === project_user_id,
    )
    const previous = projectUsers[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.project_user_id}`)
  }, [baseUrl, db.project_users, navigate, project_id, project_user_id])

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
