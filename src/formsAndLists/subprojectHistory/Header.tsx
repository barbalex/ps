import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { FaCopy } from 'react-icons/fa'
import { Button, Tooltip } from '@fluentui/react-components'
import { uuidv7 } from '@kripod/uuidv7'
import { useRef, useEffect } from 'react'

import { createSubprojectHistory } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { subprojectId, subprojectHistoryId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current subprojectHistoryId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const subprojectHistoryIdRef = useRef(subprojectHistoryId)
  useEffect(() => {
    subprojectHistoryIdRef.current = subprojectHistoryId
  }, [subprojectHistoryId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM subproject_histories WHERE subproject_id = '${subprojectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const subprojectHistoryId = await createSubprojectHistory({ subprojectId })
    if (!subprojectHistoryId) return
    navigate({
      to: `../${subprojectHistoryId}`,
    })
    autoFocusRef?.current?.focus()
  }

  const copyRow = async () => {
    try {
      // Get the current history
      const currentRes = await db.query(
        `SELECT * FROM subproject_histories WHERE subproject_history_id = $1`,
        [subprojectHistoryId],
      )
      const current = currentRes?.rows?.[0]
      if (!current) return

      // Create a new history with year = null
      const subproject_history_id = uuidv7()
      const data = {
        subproject_history_id,
        subproject_id: current.subproject_id,
        year: null,
        account_id: current.account_id,
        project_id: current.project_id,
        name: current.name,
        start_year: current.start_year,
        end_year: current.end_year,
        data: current.data,
      }

      const columns = Object.keys(data).join(',')
      const values = Object.values(data)
        .map((_, i) => `$${i + 1}`)
        .join(',')

      await db.query(
        `insert into subproject_histories (${columns}) values (${values})`,
        Object.values(data),
      )

      addOperation({
        table: 'subproject_histories',
        operation: 'insert',
        rowIdName: 'subproject_history_id',
        rowId: subproject_history_id,
        draft: data,
      })

      // Navigate to the new history
      navigate({
        to: `../${subproject_history_id}`,
      })
      autoFocusRef?.current?.focus()
    } catch (error) {
      console.error('Error copying subproject history:', error)
    }
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM subproject_histories WHERE subproject_history_id = $1`,
        [subprojectHistoryId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        `DELETE FROM subproject_histories WHERE subproject_history_id = $1`,
        [subprojectHistoryId],
      )
      addOperation({
        table: 'subproject_histories',
        rowIdName: 'subproject_history_id',
        rowId: prev.subproject_history_id,
        operation: 'delete',
        prev,
      })
      navigate({ to: `..` })
    } catch (error) {
      console.error('Error deleting subproject history:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_history_id FROM subproject_histories WHERE subproject_id = $1 ORDER BY year DESC`,
        [subprojectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.subproject_history_id === subprojectHistoryIdRef.current,
      )
      const next = rows[(index + 1) % len]
      navigate({
        to: `../${next.subproject_history_id}`,
      })
    } catch (error) {
      console.error('Error navigating to next history:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_history_id FROM subproject_histories WHERE subproject_id = $1 ORDER BY year DESC`,
        [subprojectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.subproject_history_id === subprojectHistoryIdRef.current,
      )
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `../${previous.subproject_history_id}`,
      })
    } catch (error) {
      console.error('Error navigating to previous history:', error)
    }
  }

  return (
    <FormHeader
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      siblings={
        <Tooltip content="Copy to new history without year">
          <Button
            size="medium"
            icon={<FaCopy />}
            onClick={copyRow}
          />
        </Tooltip>
      }
    />
  )
}
