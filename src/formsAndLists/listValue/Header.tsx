import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createListValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef }) => {
  const { projectId, listId, listValueId } = useParams({ strict: false })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  // Keep a ref to the current listValueId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const listValueIdRef = useRef(listValueId)
  useEffect(() => {
    listValueIdRef.current = listValueId
  }, [listValueId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM list_values WHERE list_id = '${listId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createListValue({ listId })
    console.log('New list value id:', id)
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, listValueId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM list_values WHERE list_value_id = $1`,
        [listValueId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM list_values WHERE list_value_id = $1`, [
        listValueId,
      ])
      addOperation({
        table: 'list_values',
        rowIdName: 'list_value_id',
        rowId: listValueId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT list_value_id FROM list_values WHERE list_id = $1 ORDER BY label`,
        [listId],
      )
      const listValues = res?.rows
      const len = listValues.length
      const index = listValues.findIndex(
        (p) => p.list_value_id === listValueIdRef.current,
      )
      const next = listValues[(index + 1) % len]
      navigate({
        to: `../${next.list_value_id}`,
        params: (prev) => ({ ...prev, listValueId: next.list_value_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT list_value_id FROM list_values WHERE list_id = $1 ORDER BY label`,
        [listId],
      )
      const listValues = res?.rows
      const len = listValues.length
      const index = listValues.findIndex(
        (p) => p.list_value_id === listValueIdRef.current,
      )
      const previous = listValues[(index + len - 1) % len]
      navigate({
        to: `../${previous.list_value_id}`,
        params: (prev) => ({ ...prev, listValueId: previous.list_value_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const basePath = `/data/projects/${projectId}/lists/${listId}/values/${listValueId}`

  return (
    <FormHeader
      title={formatMessage({ id: 'QMOyrE', defaultMessage: 'Listen-Wert' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="list value"
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="list_values_history"
          rowIdField="list_value_id"
          rowId={listValueId}
        />
      }
    />
  )
}
