import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { FaCopy } from 'react-icons/fa'
import { Button, Tooltip } from '@fluentui/react-components'
import { uuidv7 } from '@kripod/uuidv7'
import { useRef, useEffect } from 'react'

import { createPlaceHistory } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef }) => {
  const params = useParams({ strict: false })
  const { placeId, placeId2, placeHistoryId } = params
  const effectivePlaceId = placeId2 ?? placeId
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current placeHistoryId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const placeHistoryIdRef = useRef(placeHistoryId)
  useEffect(() => {
    placeHistoryIdRef.current = placeHistoryId
  }, [placeHistoryId])

  const addRow = async () => {
    const placeHistoryId = await createPlaceHistory({
      placeId: effectivePlaceId,
    })
    if (!placeHistoryId) return
    navigate({
      to: `../${placeHistoryId}`,
    })
    autoFocusRef?.current?.focus()
  }

  const copyRow = async () => {
    try {
      // Get the current history
      const currentRes = await db.query(
        `SELECT * FROM place_histories WHERE place_history_id = $1`,
        [placeHistoryId],
      )
      const current = currentRes?.rows?.[0]
      if (!current) return

      // Create a new history with year = null
      const place_history_id = uuidv7()
      const data = {
        place_history_id,
        place_id: current.place_id,
        year: null,
        account_id: current.account_id,
        subproject_id: current.subproject_id,
        parent_id: current.parent_id,
        level: current.level,
        since: current.since,
        until: current.until,
        data: current.data,
        geometry: current.geometry,
        bbox: current.bbox,
      }

      const columns = Object.keys(data).join(',')
      const values = Object.values(data)
        .map((_, i) => `$${i + 1}`)
        .join(',')

      await db.query(
        `insert into place_histories (${columns}) values (${values})`,
        Object.values(data),
      )

      addOperation({
        table: 'place_histories',
        operation: 'insert',
        rowIdName: 'place_history_id',
        rowId: place_history_id,
        draft: data,
      })

      // Navigate to the new history
      navigate({
        to: `../${place_history_id}`,
      })
      autoFocusRef?.current?.focus()
    } catch (error) {
      console.error('Error copying place history:', error)
    }
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM place_histories WHERE place_history_id = $1`,
        [placeHistoryId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        `DELETE FROM place_histories WHERE place_history_id = $1`,
        [placeHistoryId],
      )
      addOperation({
        table: 'place_histories',
        rowIdName: 'place_history_id',
        rowId: prev.place_history_id,
        operation: 'delete',
        prev,
      })
      navigate({ to: `..` })
    } catch (error) {
      console.error('Error deleting place history:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `
          SELECT place_history_id 
          FROM place_histories 
          WHERE place_id = $1 
          ORDER BY year DESC
        `,
        [effectivePlaceId],
      )
      const placeHistories = res?.rows
      const len = placeHistories.length
      const index = placeHistories.findIndex(
        (p) => p.place_history_id === placeHistoryIdRef.current,
      )
      const next = placeHistories[(index + 1) % len]
      const place_history_id = next.place_history_id
      navigate({
        to: `../${place_history_id}`,
      })
      autoFocusRef?.current?.focus()
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `
          SELECT place_history_id 
          FROM place_histories 
          WHERE place_id = $1 
          ORDER BY year DESC
        `,
        [effectivePlaceId],
      )
      const placeHistories = res?.rows
      const len = placeHistories.length
      const index = placeHistories.findIndex(
        (p) => p.place_history_id === placeHistoryIdRef.current,
      )
      const previous = placeHistories[(index + len - 1) % len]
      const place_history_id = previous.place_history_id
      navigate({
        to: `../${place_history_id}`,
      })
      autoFocusRef?.current?.focus()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
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
