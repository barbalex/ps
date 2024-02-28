import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import { createChart } from '../modules/createRows'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()

  const where = useMemo(() => {
    const where = { deleted: false }
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
  const { results: charts = [] } = useLiveQuery(
    db.charts.liveMany({
      where,
      orderBy: { label: 'asc' },
    }),
  )

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
    subproject_id ? `/subprojects/${subproject_id}` : ''
  }${place_id ? `/places/${place_id}` : ''}${
    place_id2 ? `/places/${place_id2}` : ''
  }/charts`

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
    navigate(`${baseUrl}/${data.chart_id}`)
  }, [baseUrl, db.charts, place_id, place_id2, project_id, subproject_id])

  // TODO: get uploader css locally if it should be possible to upload charts
  // offline to sqlite
  return (
    <div className="list-view">
      <ListViewHeader title="Files" tableName="chart" addRow={add} />
      <div className="list-container">
        {charts.map(({ chart_id, label }) => (
          <Row key={chart_id} label={label} to={`${baseUrl}/${chart_id}`} />
        ))}
      </div>
    </div>
  )
}
