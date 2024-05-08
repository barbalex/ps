import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../ElectricProvider.tsx'
import { createChart } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, place_id, place_id2, chart_id } =
    useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const designing = appState?.designing ?? false

  const addRow = useCallback(async () => {
    const idToAdd = place_id2
      ? { place_id2 }
      : place_id
      ? { place_id }
      : subproject_id
      ? { subproject_id }
      : { project_id }
    const data = createChart(idToAdd)
    await db.charts.create({ data })
    navigate({
      pathname: `../${data.chart_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db.charts,
    navigate,
    place_id,
    place_id2,
    project_id,
    searchParams,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.charts.delete({ where: { chart_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.charts, chart_id, navigate, searchParams])

  const where = useMemo(() => {
    const where = {}
    if (place_id2) {
      where.place_id2 = place_id2
    } else if (place_id) {
      where.place_id = place_id
    } else if (subproject_id) {
      where.subproject_id = subproject_id
    } else if (project_id) {
      where.project_id = project_id
    }
    return where
  }, [place_id, place_id2, project_id, subproject_id])

  const toNext = useCallback(async () => {
    const charts = await db.charts.findMany({
      where,
      orderBy: { label: 'asc' },
    })
    const len = charts.length
    const index = charts.findIndex((p) => p.chart_id === chart_id)
    const next = charts[(index + 1) % len]
    navigate({
      pathname: `../${next.chart_id}`,
      search: searchParams.toString(),
    })
  }, [db.charts, where, navigate, searchParams, chart_id])

  const toPrevious = useCallback(async () => {
    const charts = await db.charts.findMany({
      where,
      orderBy: { label: 'asc' },
    })
    const len = charts.length
    const index = charts.findIndex((p) => p.chart_id === chart_id)
    const previous = charts[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.chart_id}`,
      search: searchParams.toString(),
    })
  }, [db.charts, where, navigate, searchParams, chart_id])

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
