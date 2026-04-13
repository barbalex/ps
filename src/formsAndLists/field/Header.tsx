import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createField } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { formatMessage } = useIntl()
  const { projectId, userId, accountId, fieldId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const basePath = projectId
    ? `/data/projects/${projectId}/fields/${fieldId}`
    : `/data/users/${userId}/accounts/${accountId}/project-fields/${fieldId}`

  const db = usePGlite()

  // Keep a ref to the current fieldId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const fieldIdRef = useRef(fieldId)
  useEffect(() => {
    fieldIdRef.current = fieldId
  }, [fieldId])

  const whereScope = projectId
    ? `project_id = '${projectId}'`
    : `project_id IS NULL AND account_id = '${accountId}'`

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM fields WHERE ${whereScope}`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createField({ projectId, accountId })
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, fieldId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM fields WHERE field_id = $1`,
        [fieldId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM fields WHERE field_id = $1`, [fieldId])
      addOperation({
        table: 'fields',
        rowIdName: 'field_id',
        rowId: fieldId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting field:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(`
      SELECT field_id 
      FROM fields 
      WHERE ${whereScope}
      ORDER BY label`)
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.field_id === fieldIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({
        to: `../${next.field_id}`,
        params: (prev) => ({ ...prev, fieldId: next.field_id }),
      })
    } catch (error) {
      console.error('Error navigating to next field:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `
      SELECT field_id 
      FROM fields 
      WHERE ${whereScope}
      ORDER BY label`,
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.field_id === fieldIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `../${previous.field_id}`,
        params: (prev) => ({ ...prev, fieldId: previous.field_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous field:', error)
    }
  }

  return (
    <FormHeader
      title={
        accountId
          ? formatMessage({
              id: 'field.projectFieldSingular',
              defaultMessage: 'Project Field',
            })
          : formatMessage({ id: '61ELuB', defaultMessage: 'Feld' })
      }
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="field"
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="fields_history"
          rowIdField="field_id"
          rowId={fieldId}
        />
      }
    />
  )
}
