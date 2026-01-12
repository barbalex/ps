import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createProjectUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/users/$projectUserId/'

export const Header = ({ autoFocusRef }) => {
  const { projectId, projectUserId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createProjectUser({ projectId })
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        projectUserId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM project_users WHERE project_user_id = $1`,
        [projectUserId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM project_users WHERE project_user_id = $1`, [
        projectUserId,
      ])
      addOperation({
        table: 'project_users',
        rowIdName: 'project_user_id',
        rowId: projectUserId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting project user:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
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
    } catch (error) {
      console.error('Error navigating to next project user:', error)
    }
  }

  const toPrevious = async () => {
    try {
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
    } catch (error) {
      console.error('Error navigating to previous project user:', error)
    }
  }

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
}
