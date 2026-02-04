import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createSubprojectUser } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/users/$subprojectUserId/'

export const Header = ({ autoFocusRef }) => {
  const { subprojectId, subprojectUserId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current subprojectUserId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const subprojectUserIdRef = useRef(subprojectUserId)
  useEffect(() => {
    subprojectUserIdRef.current = subprojectUserId
  }, [subprojectUserId])

  const addRow = async () => {
    const id = await createSubprojectUser({ subprojectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        subprojectUserId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM subproject_users WHERE subproject_user_id = $1`,
        [subprojectUserId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        `DELETE FROM subproject_users WHERE subproject_user_id = $1`,
        [subprojectUserId],
      )
      addOperation({
        table: 'subproject_users',
        rowIdName: 'subproject_user_id',
        rowId: subprojectUserId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting subproject user:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_user_id FROM subproject_users WHERE subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.subproject_user_id === subprojectUserIdRef.current,
      )
      const next = rows[(index + 1) % len]
      navigate({
        to: `../${next.subproject_user_id}`,
        params: (prev) => ({
          ...prev,
          subprojectUserId: next.subproject_user_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next subproject user:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_user_id FROM subproject_users WHERE subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.subproject_user_id === subprojectUserIdRef.current,
      )
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `../${previous.subproject_user_id}`,
        params: (prev) => ({
          ...prev,
          subprojectUserId: previous.subproject_user_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous subproject user:', error)
    }
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
