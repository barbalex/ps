import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createChart } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { designingAtom } from '../../store.ts'

export const Header = memo(({ autoFocusRef }) => {
  const [designing] = useAtom(designingAtom)
  const { project_id, subproject_id, place_id, place_id2, chart_id } =
    useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const idToAdd = place_id2
      ? { place_id2 }
      : place_id
      ? { place_id }
      : subproject_id
      ? { subproject_id }
      : { project_id }
    const res = await createChart({ ...idToAdd, db })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.chart_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db,
    navigate,
    place_id,
    place_id2,
    project_id,
    searchParams,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.query(`delete from charts where chart_id = $1`, [chart_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, chart_id, navigate, searchParams])

  const { filterField, filterValue } = useMemo(() => {
    let filterField
    let filterValue
    if (place_id2) {
      filterField = 'place_id2'
      filterValue = place_id2
    } else if (place_id) {
      filterField = 'place_id'
      filterValue = place_id
    } else if (subproject_id) {
      filterField = 'subproject_id'
      filterValue = subproject_id
    } else if (project_id) {
      filterField = 'project_id'
      filterValue = project_id
    }
    return { filterField, filterValue }
  }, [place_id, place_id2, project_id, subproject_id])

  const toNext = useCallback(async () => {
    const result = await db.query(
      `select * from charts where ${filterField} = $1 order by label asc`,
      [filterValue],
    )
    const charts = result?.rows
    const len = charts.length
    const index = charts.findIndex((p) => p.chart_id === chart_id)
    const next = charts[(index + 1) % len]
    navigate({
      pathname: `../${next.chart_id}`,
      search: searchParams.toString(),
    })
  }, [db, filterField, filterValue, navigate, searchParams, chart_id])

  const toPrevious = useCallback(async () => {
    const result = await db.query(
      `select * from charts where ${filterField} = $1 order by label asc`,
      [filterValue],
    )
    const charts = result?.rows
    const len = charts.length
    const index = charts.findIndex((p) => p.chart_id === chart_id)
    const previous = charts[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.chart_id}`,
      search: searchParams.toString(),
    })
  }, [db, filterField, filterValue, navigate, searchParams, chart_id])

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
