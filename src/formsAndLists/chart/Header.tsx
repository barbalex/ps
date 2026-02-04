import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createChart } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { designingAtom, addOperationAtom } from '../../store.ts'

const getFilter = ({ placeId, placeId2, projectId, subprojectId }) => {
  let filterField
  let filterValue
  if (placeId2) {
    filterField = 'place_id'
    filterValue = placeId2
  } else if (placeId) {
    filterField = 'place_id'
    filterValue = placeId
  } else if (subprojectId) {
    filterField = 'subproject_id'
    filterValue = subprojectId
  } else if (projectId) {
    filterField = 'project_id'
    filterValue = projectId
  }
  return { filterField, filterValue }
}

export const Header = ({ autoFocusRef, from }) => {
  const isForm =
    from ===
    '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/chart'
  const [designing] = useAtom(designingAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const { projectId, subprojectId, placeId, placeId2, chartId } = useParams({
    from,
  })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const idToAdd =
      placeId2 ? { placeId: placeId2 }
      : placeId ? { placeId }
      : subprojectId ? { subprojectId }
      : { projectId }
    const chart_id = await createChart(idToAdd)
    navigate({
      to: isForm ? `../../${chart_id}/chart` : `../${chart_id}/chart`,
      params: (prev) => ({ ...prev, chartId: chart_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(`SELECT * FROM charts WHERE chart_id = $1`, [
      chartId,
    ])
    const prev = prevRes?.rows?.[0] ?? {}
    await db.query(`delete from charts where chart_id = $1`, [chartId])
    addOperation({
      table: 'charts',
      rowIdName: 'chart_id',
      rowId: chartId,
      operation: 'delete',
      prev,
    })
    navigate({ to: isForm ? `../..` : `..` })
  }

  const { filterField, filterValue } = getFilter({
    placeId,
    placeId2,
    projectId,
    subprojectId,
  })

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM charts WHERE ${filterField} = '${filterValue}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const toNext = async () => {
    const res = await db.query(
      `select chart_id from charts where ${filterField} = $1 order by label`,
      [filterValue],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.chart_id === chartId)
    const next = rows[(index + 1) % len]
    navigate({
      to: isForm ? `../../${next.chart_id}/chart` : `../${next.chart_id}`,
      params: (prev) => ({ ...prev, chartId: next.chart_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `select chart_id from charts where ${filterField} = $1 order by label`,
      [filterValue],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.chart_id === chartId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to:
        isForm ? `../../${previous.chart_id}/chart` : `../${previous.chart_id}`,
      params: (prev) => ({ ...prev, chartId: previous.chart_id }),
    })
  }

  return (
    <FormHeader
      title="Chart"
      addRow={designing ? addRow : undefined}
      deleteRow={designing ? deleteRow : undefined}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="chart"
    />
  )
}
