import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createProjectUser } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, project_user_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const projectUser = createProjectUser()
    await db.project_users.create({
      data: { ...projectUser, project_id },
    })
    navigate({
      pathname: `../${projectUser.project_user_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.project_users, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.project_users.delete({ where: { project_user_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.project_users, navigate, project_user_id, searchParams])

  const toNext = useCallback(async () => {
    const projectUsers = await db.project_users.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectUsers.length
    const index = projectUsers.findIndex(
      (p) => p.project_user_id === project_user_id,
    )
    const next = projectUsers[(index + 1) % len]
    navigate({
      pathname: `../${next.project_user_id}`,
      search: searchParams.toString(),
    })
  }, [db.project_users, navigate, project_id, project_user_id, searchParams])

  const toPrevious = useCallback(async () => {
    const projectUsers = await db.project_users.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectUsers.length
    const index = projectUsers.findIndex(
      (p) => p.project_user_id === project_user_id,
    )
    const previous = projectUsers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.project_user_id}`,
      search: searchParams.toString(),
    })
  }, [db.project_users, navigate, project_id, project_user_id, searchParams])

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
