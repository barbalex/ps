import { useParams, useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import type { TableRowFilter } from '../../store.ts'

import { createCheck } from '../../modules/createRows.ts'
import { siblingRecordPath } from '../../modules/siblingRecordPath.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { Geometry } from '../../components/FormMenu/Geometry.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'

export const Header = ({
  autoFocusRef,
  from,
  allInline = false,
}: {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  from: string
  allInline?: boolean
}) =>  {
  // works for plain checks and for checks of a filtered view
  const isForm = from.endsWith('/checks/$checkId_/check')
  const { formatMessage, locale } = useIntl()
  const { projectId, subprojectId, placeId, placeId2, tableViewId, checkId } =
    useParams({
      strict: false,
    })

  // names of the filtered view this check belongs to (if any)
  const resTableView = useLiveQuery(
    tableViewId
      ? `SELECT name_singular_de, name_singular_en, name_singular_fr, name_singular_it, filter FROM table_views WHERE table_view_id = $1`
      : `SELECT 1 WHERE false`,
    tableViewId ? [tableViewId] : [],
  )
  const lang = locale.split('-')[0]
  const tableView = resTableView?.rows?.[0] as
    | Record<string, unknown>
    | undefined
  const checkTitle =
    (tableViewId &&
      ((tableView?.[`name_singular_${lang}`] as string | null) ??
        (tableView?.name_singular_de as string | null))) ||
    formatMessage({ id: 'ZCwpER', defaultMessage: 'Kontrolle' })

  const requestDelete = useRequestRowDelete()
  const navigate = useNavigate()

  const db = usePGlite()

  // Keep a ref to the current checkId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const checkIdRef = useRef(checkId)
  useEffect(() => {
    checkIdRef.current = checkId
  }, [checkId])

  // the view's static filter narrows counts and sibling navigation
  const viewFilterString = tableViewId
    ? filterStringFromFilter((tableView?.filter ?? []) as TableRowFilter[])
    : ''
  const hasViewFilter = !!viewFilterString

  const basePath = `${placeId2 ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}` : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}`}${tableViewId ? `/table-views/${tableViewId}` : ''}/checks/${checkId}`

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM checks WHERE place_id = '${placeId2 ?? placeId}'${hasViewFilter ? ` AND (${viewFilterString})` : ''}`,
  )
  const rowCount = (countRes?.rows?.[0]?.count as number) ?? 2

  const addRow = async () => {
    const id = await createCheck({
      projectId: projectId!,
      placeId: placeId2 ?? placeId!,
      tableViewId,
    })
    if (!id) return
    navigate({ to: siblingRecordPath(basePath, id, allInline ? undefined : 'check') })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'checks',
      rowIdName: 'check_id',
      rowId: checkId!,
      navigateTo: isForm ? ('../..' as '..') : '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT check_id FROM checks WHERE place_id = $1${hasViewFilter ? ` AND (${viewFilterString})` : ''} ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const checks = res?.rows as { check_id: string }[]
      const len = checks.length
      const index = checks.findIndex((p) => p.check_id === checkIdRef.current)
      const next = checks[(index + 1) % len]
      navigate({
        to: allInline
          ? isForm
            ? `../../${next.check_id}`
            : `../${next.check_id}`
          : isForm
            ? `../../${next.check_id}/check`
            : `../${next.check_id}`,
        params: (prev) => ({ ...prev, checkId: next.check_id }),
      })
    } catch (error) {
      console.error('Error navigating to next check:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT check_id FROM checks WHERE place_id = $1${hasViewFilter ? ` AND (${viewFilterString})` : ''} ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const checks = res?.rows as { check_id: string }[]
      const len = checks.length
      const index = checks.findIndex((p) => p.check_id === checkIdRef.current)
      const previous = checks[(index + len - 1) % len]
      navigate({
        to: allInline
          ? isForm
            ? `../../${previous.check_id}`
            : `../${previous.check_id}`
          : isForm
            ? `../../${previous.check_id}/check`
            : `../${previous.check_id}`,
        params: (prev) => ({ ...prev, checkId: previous.check_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous check:', error)
    }
  }

  return (
    <FormHeader
      title={checkTitle}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName={checkTitle}
      siblings={
        <>
          <Geometry
            table="checks"
            rowId={checkId}
            level={placeId2 ? 2 : 1}
          />
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={`${basePath}/check`}
            historyTable="checks_history"
            rowIdField="check_id"
            rowId={checkId}
          />
        </>
      }
    />
  )
}
