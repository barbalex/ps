import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useCorbado } from '@corbado/react'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createChart } from '../modules/createRows.ts'

import '../form.css'

import { useElectric } from '../ElectricProvider.tsx'

export const Component = memo(() => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { user: authUser } = useCorbado()

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

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const designing = appState?.designing ?? false
  const { results: charts = [] } = useLiveQuery(
    db.charts.liveMany({
      where,
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const idToAdd = place_id2
      ? { place_id2 }
      : place_id
      ? { place_id }
      : subproject_id
      ? { subproject_id }
      : { project_id }
    const data = createChart(idToAdd)
    await db.charts.create({ data })
    navigate({ pathname: data.chart_id, search: searchParams.toString() })
  }, [
    db.charts,
    navigate,
    place_id,
    place_id2,
    project_id,
    searchParams,
    subproject_id,
  ])

  // console.log('charts', charts)

  // TODO: get uploader css locally if it should be possible to upload charts
  // offline to sqlite
  return (
    <div className="list-view">
      <ListViewHeader
        title="Charts"
        tableName="chart"
        addRow={designing ? add : undefined}
      />
      <div className="list-container">
        {charts.map(({ chart_id, label }) => (
          <Row key={chart_id} label={label ?? chart_id} to={chart_id} />
        ))}
      </div>
    </div>
  )
})
