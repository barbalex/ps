import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createChart } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { designingAtom } from '../../store.ts'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId/'

export const Header = memo(({ autoFocusRef }) => {
  const [designing] = useAtom(designingAtom)
  const { projectId, subprojectId, placeId, placeId2, chartId } = useParams({
    from,
  })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const idToAdd =
      placeId2 ? { placeId: placeId2 }
      : placeId ? { placeId }
      : subprojectId ? { subprojectId }
      : { projectId }
    const res = await createChart({ ...idToAdd, db })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.chart_id}`,
      params: (prev) => ({ ...prev, chartId: data.chart_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, placeId, placeId2, projectId, subprojectId])

  const deleteRow = useCallback(async () => {
    await db.query(`delete from charts where chart_id = $1`, [chartId])
    navigate({ to: '..' })
  }, [db, chartId, navigate])

  const { filterField, filterValue } = useMemo(() => {
    let filterField
    let filterValue
    if (placeId2) {
      filterField = 'place_id2'
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
  }, [placeId, placeId2, projectId, subprojectId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `select chart_id from charts where ${filterField} = $1 order by label`,
      [filterValue],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.chart_id === chartId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `../${next.chart_id}`,
      params: (prev) => ({ ...prev, chartId: next.chart_id }),
    })
  }, [db, filterField, filterValue, navigate, chartId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `select chart_id from charts where ${filterField} = $1 order by label`,
      [filterValue],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.chart_id === chartId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `../${previous.chart_id}`,
      params: (prev) => ({ ...prev, chartId: previous.chart_id }),
    })
  }, [db, filterField, filterValue, navigate, chartId])

  return (
    <FormHeader
      title="Chart"
      addRow={designing ? addRow : undefined}
      deleteRow={designing ? deleteRow : undefined}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="chart"
    />
  )
})
