import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createActionQuantity } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'

export const Header = ({
  autoFocusRef,
}: {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  from?: string
}) => {
  const { projectId, subprojectId, placeId, placeId2, actionId, actionQuantityId } =
    useParams({ strict: false })
  const navigate = useNavigate()
  const requestDelete = useRequestRowDelete()
  const { formatMessage } = useIntl()
  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/actions/${actionId}/quantities/${actionQuantityId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/actions/${actionId}/quantities/${actionQuantityId}`

  const db = usePGlite()

  // Keep a ref to the current actionQuantityId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const actionQuantityIdRef = useRef(actionQuantityId)
  useEffect(() => {
    actionQuantityIdRef.current = actionQuantityId
  }, [actionQuantityId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM action_quantities WHERE action_id = '${actionId}'`,
  )
  const rowCount = (countRes?.rows?.[0]?.count as number | undefined) ?? 2

  const addRow = async () => {
    const id = await createActionQuantity({
      actionId: actionId!,
    } as { actionId: string; projectId: string })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        actionQuantityId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'action_quantities',
      rowIdName: 'action_quantity_id',
      rowId: actionQuantityId!,
      navigateTo: '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query<{ action_quantity_id: string }>(
        'SELECT action_quantity_id FROM action_quantities WHERE action_id = $1 ORDER BY label',
        [actionId],
      )
      const actionQuantities = res?.rows
      const len = actionQuantities.length
      const index = actionQuantities.findIndex(
        (p) => p.action_quantity_id === actionQuantityIdRef.current,
      )
      const next = actionQuantities[(index + 1) % len]
      navigate({
        to: `../${next.action_quantity_id}`,
        params: (prev) => ({
          ...prev,
          actionQuantityId: next.action_quantity_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next action value:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query<{ action_quantity_id: string }>(
        'SELECT action_quantity_id FROM action_quantities WHERE action_id = $1 ORDER BY label',
        [actionId],
      )
      const actionQuantities = res?.rows
      const len = actionQuantities.length
      const index = actionQuantities.findIndex(
        (p) => p.action_quantity_id === actionQuantityIdRef.current,
      )
      const previous = actionQuantities[(index + len - 1) % len]
      navigate({
        to: `../${previous.action_quantity_id}`,
        params: (prev) => ({
          ...prev,
          actionQuantityId: previous.action_quantity_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous action value:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'bCZDEF', defaultMessage: 'Massnahmen-Menge' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="action value"
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="action_quantities_history"
          rowIdField="action_quantity_id"
          rowId={actionQuantityId}
        />
      }
    />
  )
}
