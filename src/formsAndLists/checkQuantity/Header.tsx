import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createCheckQuantity } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom } from '../../store.ts'
import { useIntl } from 'react-intl'

export const Header = ({ autoFocusRef, from }) => {
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
    checkQuantityId,
  } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const quantityTitle = formatMessage({ id: 'TmPR2+', defaultMessage: 'Menge' })
  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/checks/${checkId}/quantities/${checkQuantityId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/checks/${checkId}/quantities/${checkQuantityId}`

  const db = usePGlite()

  // Keep a ref to the current checkQuantityId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const checkQuantityIdRef = useRef(checkQuantityId)
  useEffect(() => {
    checkQuantityIdRef.current = checkQuantityId
  }, [checkQuantityId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM check_quantities WHERE check_id = '${checkId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createCheckQuantity({ checkId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, checkQuantityId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        'SELECT * FROM check_quantities WHERE check_quantity_id = $1',
        [checkQuantityId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        'DELETE FROM check_quantities WHERE check_quantity_id = $1',
        [checkQuantityId],
      )
      addOperation({
        table: 'check_quantities',
        rowIdName: 'check_quantity_id',
        rowId: checkQuantityId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting check value:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT check_quantity_id FROM check_quantities WHERE check_id = $1 ORDER BY label',
        [checkId],
      )
      const checkQuantities = res?.rows
      const len = checkQuantities.length
      const index = checkQuantities.findIndex(
        (p) => p.check_quantity_id === checkQuantityIdRef.current,
      )
      const next = checkQuantities[(index + 1) % len]
      navigate({
        to: `../${next.check_quantity_id}`,
        params: (prev) => ({
          ...prev,
          checkQuantityId: next.check_quantity_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next check value:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT check_quantity_id FROM check_quantities WHERE check_id = $1 ORDER BY label',
        [checkId],
      )
      const checkQuantities = res?.rows
      const len = checkQuantities.length
      const index = checkQuantities.findIndex(
        (p) => p.check_quantity_id === checkQuantityIdRef.current,
      )
      const previous = checkQuantities[(index + len - 1) % len]
      navigate({
        to: `../${previous.check_quantity_id}`,
        params: (prev) => ({
          ...prev,
          checkQuantityId: previous.check_quantity_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous check value:', error)
    }
  }

  return (
    <FormHeader
      title={quantityTitle}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName={quantityTitle}
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="check_quantities_history"
          rowIdField="check_quantity_id"
          rowId={checkQuantityId}
        />
      }
    />
  )
}
