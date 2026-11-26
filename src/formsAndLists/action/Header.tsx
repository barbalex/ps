import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createAction } from '../../modules/createRows.ts'
import { siblingRecordPath } from '../../modules/siblingRecordPath.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { Geometry } from '../../components/FormMenu/Geometry.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import type { TableRowFilter } from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'

export const Header = ({
  autoFocusRef,
  from,
  allInline = false,
}: {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  from: string
  allInline?: boolean
}) => {
  const { formatMessage, locale } = useIntl()
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/action' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/action'
  const requestDelete = useRequestRowDelete()

  const { projectId, subprojectId, placeId, placeId2, tableViewId, actionId } = useParams({ strict: false })

  // names of the table view this action belongs to (if any)
  const resTableView = useLiveQuery(
    tableViewId
      ? `SELECT name_singular_de, name_singular_en, name_singular_fr, name_singular_it, filter FROM table_views WHERE table_view_id = $1`
      : `SELECT 1 WHERE false`,
    tableViewId ? [tableViewId] : [],
  )
  const tableView = resTableView?.rows?.[0] as
    | Record<string, unknown>
    | undefined
  const actionTitle =
    (tableViewId &&
      ((tableView?.[`name_singular_${locale.split('-')[0]}`] as string | null) ??
        (tableView?.name_singular_de as string | null))) ||
    undefined

  // the view's static filter narrows counts and sibling navigation
  const viewFilterString = tableViewId
    ? filterStringFromFilter((tableView?.filter ?? []) as TableRowFilter[])
    : ''
  const hasViewFilter = !!viewFilterString

  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}${tableViewId ? `/table-views/${tableViewId}` : ''}/actions/${actionId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${tableViewId ? `/table-views/${tableViewId}` : ''}/actions/${actionId}`
  const navigate = useNavigate()

  const db = usePGlite()

  // Keep a ref to the current actionId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const actionIdRef = useRef(actionId)
  useEffect(() => {
    actionIdRef.current = actionId
  }, [actionId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM actions WHERE place_id = '${placeId2 ?? placeId}'${hasViewFilter ? ` AND (${viewFilterString})` : ''}`,
  )
  const rowCount = (countRes?.rows?.[0]?.count as number | undefined) ?? 2

  const addRow = async () => {
    const id = await createAction({
      projectId: projectId!,
      placeId: placeId2 ?? placeId!,
      tableViewId,
    })
    if (!id) return
    navigate({ to: siblingRecordPath(basePath, id, allInline ? undefined : 'action') })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'actions',
      rowIdName: 'action_id',
      rowId: actionId!,
      navigateTo: isForm ? ('../..' as '..') : '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query<{ action_id: string }>(
        `SELECT action_id FROM actions WHERE place_id = $1${hasViewFilter ? ` AND (${viewFilterString})` : ''} ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const actions = res?.rows
      const len = actions.length
      const index = actions.findIndex(
        (p) => p.action_id === actionIdRef.current,
      )
      const next = actions[(index + 1) % len]
      navigate({
        to: isForm ? `../../${next.action_id}/action` : `../${next.action_id}`,
        params: (prev) => ({ ...prev, actionId: next.action_id }),
      })
    } catch (error) {
      console.error('Error navigating to next action:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query<{ action_id: string }>(
        `SELECT action_id FROM actions WHERE place_id = $1${hasViewFilter ? ` AND (${viewFilterString})` : ''} ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const actions = res?.rows
      const len = actions.length
      const index = actions.findIndex(
        (p) => p.action_id === actionIdRef.current,
      )
      const previous = actions[(index + len - 1) % len]
      navigate({
        to: isForm
          ? `../../${previous.action_id}/action`
          : `../${previous.action_id}`,
        params: (prev) => ({ ...prev, actionId: previous.action_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous action:', error)
    }
  }

  return (
    <FormHeader
      title={
        actionTitle ??
        formatMessage({ id: 'upa2nh', defaultMessage: 'Massnahme' })
      }
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="action"
      siblings={
        <>
          <Geometry
            table="actions"
            rowId={actionId}
            level={placeId2 ? 2 : 1}
          />
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={`${basePath}/action`}
            historyTable="actions_history"
            rowIdField="action_id"
            rowId={actionId}
          />
        </>
      }
    />
  )
}
