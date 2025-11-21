import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId/'

export const Header = ({ autoFocusRef }) => {
  const { subprojectId, subprojectUserId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createSubprojectUser({ subprojectId, db })
    const row = res?.rows?.[0]
    console.log('SubprojectUser.Header.addRow', { res, row })
    navigate({
      to: `../${row.subproject_user_id}`,
      params: (prev) => ({
        ...prev,
        subprojectUserId: row.subproject_user_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM subproject_users WHERE subproject_user_id = $1`, [
      subprojectUserId,
    ])
    navigate({ to: '..' })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT subproject_user_id FROM subproject_users WHERE subproject_id = $1 ORDER BY label`,
      [subprojectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex(
      (p) => p.subproject_user_id === subprojectUserId,
    )
    const next = rows[(index + 1) % len]
    navigate({
      to: `../${next.subproject_user_id}`,
      params: (prev) => ({
        ...prev,
        subprojectUserId: next.subproject_user_id,
      }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT subproject_user_id FROM subproject_users WHERE subproject_id = $1 ORDER BY label`,
      [subprojectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex(
      (p) => p.subproject_user_id === subprojectUserId,
    )
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `../${previous.subproject_user_id}`,
      params: (prev) => ({
        ...prev,
        subprojectUserId: previous.subproject_user_id,
      }),
    })
  }

  return (
    <FormHeader
      title="Subproject User"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="subproject user"
    />
  )
}
