import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { subprojectId, subprojectUserId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = createSubprojectUser({ subprojectId, db })
    const subprojectUser = res?.rows?.[0]
    navigate({
      pathname: `../${subprojectUser.subproject_user_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [subprojectId, db, navigate, searchParams, autoFocusRef])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM subproject_users WHERE subproject_user_id = $1`, [
      subprojectUserId,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, subprojectUserId, navigate, searchParams])

  const toNext = useCallback(async () => {
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
      pathname: `../${next.subproject_user_id}`,
      search: searchParams.toString(),
    })
  }, [db, subprojectId, navigate, searchParams, subprojectUserId])

  const toPrevious = useCallback(async () => {
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
      pathname: `../${previous.subproject_user_id}`,
      search: searchParams.toString(),
    })
  }, [db, subprojectId, navigate, searchParams, subprojectUserId])

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
})
