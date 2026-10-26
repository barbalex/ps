import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createChart } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { designingAtom, addOperationAtom } from '../../store.ts'

// mirrors useChartsNavData: within a subproject, the project's chart
// templates (for_subprojects, without an own subproject/place) appear
// alongside the subproject's own charts; on the project itself, the two
// sections are separate lists
const getFilter = ({
  placeId,
  placeId2,
  projectId,
  subprojectId,
  forSubprojects,
}: {
  placeId?: string
  placeId2?: string
  projectId?: string
  subprojectId?: string
  forSubprojects?: boolean
}) => {
  if (placeId2 || placeId) {
    return { clause: 'place_id = $1', params: [placeId2 ?? placeId] }
  }
  if (subprojectId) {
    return {
      clause:
        '(subproject_id = $1 OR (for_subprojects AND project_id = $2 AND subproject_id IS NULL))',
      params: [subprojectId, projectId],
    }
  }
  return {
    clause: 'project_id = $1 AND for_subprojects = $2',
    params: [projectId, forSubprojects ?? false],
  }
}

export const Header = ({
  autoFocusRef,
  from,
}: {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  from: string
}) => {
  const { formatMessage } = useIntl()
  // only the settings page is a detail view — the chart itself renders at
  // the chart node's own url
  const isDetailView = from.endsWith('/settings')
  const addOperation = useSetAtom(addOperationAtom)
  const { projectId, subprojectId, placeId, placeId2, chartId } = useParams({ strict: false })
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  // charts live under a subproject (or place) or on the project itself, in
  // one of its two sections: charts or charts for subprojects (templates)
  const chartsSegment = from.includes('subproject-charts')
    ? 'subproject-charts'
    : 'charts'
  const basePath = subprojectId
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/charts/${chartId}`
    : `/data/projects/${projectId}/${chartsSegment}/${chartId}`
  const navigate = useNavigate()

  const db = usePGlite()

  // Keep a ref to the current chartId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const chartIdRef = useRef(chartId)
  useEffect(() => {
    chartIdRef.current = chartId
  }, [chartId])

  const addRow = async () => {
    const idToAdd = placeId2
      ? { placeId: placeId2 }
      : placeId
        ? { placeId }
        : subprojectId
          ? { subprojectId }
          : {
              projectId,
              // charts created on the project belong to the section they are
              // created in: templates or the project's own charts
              forSubprojects: from.includes('subproject-charts'),
            }
    const chart_id = await createChart(idToAdd)
    navigate({
      to: isDetailView ? `../../${chart_id}/settings` : `../${chart_id}`,
      params: (prev) => ({ ...prev, chartId: chart_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(`SELECT * FROM charts WHERE chart_id = $1`, [
      chartId,
    ])
    const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
    await db.query(`delete from charts where chart_id = $1`, [chartId])
    addOperation({
      table: 'charts',
      rowIdName: 'chart_id',
      rowId: chartId,
      operation: 'delete',
      prev,
    })
    navigate({ to: isDetailView ? ('../..' as '..') : '..' })
  }

  const { clause, params } = getFilter({
    placeId,
    placeId2,
    projectId,
    subprojectId,
    forSubprojects: chartsSegment === 'subproject-charts',
  })

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM charts WHERE ${clause}`,
    params,
  )
  const rowCount = (countRes?.rows?.[0]?.count as number) ?? 2

  const toNext = async () => {
    const res = await db.query(
      `select chart_id from charts where ${clause} order by label`,
      params,
    )
    const rows = res?.rows as { chart_id: string }[]
    const len = rows.length
    if (!len) return
    const index = rows.findIndex((p) => p.chart_id === chartIdRef.current)
    const next = rows[(index + 1) % len]
    navigate({
      to: isDetailView
        ? `../../${next.chart_id}/settings`
        : `../${next.chart_id}`,
      params: (prev) => ({ ...prev, chartId: next.chart_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `select chart_id from charts where ${clause} order by label`,
      params,
    )
    const rows = res?.rows as { chart_id: string }[]
    const len = rows.length
    if (!len) return
    const index = rows.findIndex((p) => p.chart_id === chartIdRef.current)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: isDetailView
        ? `../../${previous.chart_id}/settings`
        : `../${previous.chart_id}`,
      params: (prev) => ({ ...prev, chartId: previous.chart_id }),
    })
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'vMlktr', defaultMessage: 'Diagramm' })}
      addRow={designing ? addRow : undefined}
      deleteRow={designing ? deleteRow : undefined}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="chart"
      siblings={
        isDetailView ? (
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={`${basePath}/settings`}
            historyTable="charts_history"
            rowIdField="chart_id"
            rowId={chartId}
          />
        ) : undefined
      }
    />
  )
}
