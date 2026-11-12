import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createFieldGroup } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({
  autoFocusRef,
}: {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
}) => {
  const { projectId, tableName, fieldGroupId } = useParams({ strict: false })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  // Keep a ref to the current fieldGroupId so it's always fresh in callbacks
  const fieldGroupIdRef = useRef(fieldGroupId)
  useEffect(() => {
    fieldGroupIdRef.current = fieldGroupId
  }, [fieldGroupId])

  // next/previous stay within the groups of the same table
  const tableFilter = tableName ? `AND table_name = '${tableName}'` : ''
  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM field_groups WHERE project_id = $1 ${tableFilter}`,
    [projectId],
  )
  const rowCount = Number(countRes?.rows?.[0]?.count ?? 2)

  const addRow = async () => {
    const id = await createFieldGroup({
      projectId: projectId!,
      tableName: tableName ?? 'checks',
    })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, fieldGroupId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM field_groups WHERE field_group_id = $1`,
        [fieldGroupId],
      )
      const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
      await db.query(
        `DELETE FROM field_groups WHERE field_group_id = $1`,
        [fieldGroupId],
      )
      addOperation({
        table: 'field_groups',
        rowIdName: 'field_group_id',
        rowId: fieldGroupId,
        operation: 'delete',
        prev,
      })
      // views referencing the group lose it (ON DELETE SET NULL)
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting field group:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT field_group_id FROM field_groups WHERE project_id = $1 ${tableFilter} ORDER BY label`,
        [projectId],
      )
      const groups = res?.rows as { field_group_id: string }[]
      const len = groups.length
      const index = groups.findIndex(
        (p) => p.field_group_id === fieldGroupIdRef.current,
      )
      const next = groups[(index + 1) % len]
      navigate({
        to: `../${next.field_group_id}`,
        params: (prev) => ({ ...prev, fieldGroupId: next.field_group_id }),
      })
    } catch (error) {
      console.error('Error navigating to next field group:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT field_group_id FROM field_groups WHERE project_id = $1 ${tableFilter} ORDER BY label`,
        [projectId],
      )
      const groups = res?.rows as { field_group_id: string }[]
      const len = groups.length
      const index = groups.findIndex(
        (p) => p.field_group_id === fieldGroupIdRef.current,
      )
      const previous = groups[(index + len - 1) % len]
      navigate({
        to: `../${previous.field_group_id}`,
        params: (prev) => ({
          ...prev,
          fieldGroupId: previous.field_group_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous field group:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({
        id: 'vN8wL2',
        defaultMessage: 'Feldergruppe',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="fieldGroup"
    />
  )
}
