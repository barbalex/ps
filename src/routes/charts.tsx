import { useCallback, useMemo, memo } from 'react'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createChart } from '../modules/createRows.ts'

import '../form.css'

import { designingAtom } from '../store.ts'

export const Component = memo(() => {
  const [designing] = useAtom(designingAtom)
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const where = useMemo(() => {
    let where = undefined
    if (place_id2) {
      where = `place_id2 = ${place_id2}`
    } else if (place_id) {
      where = `place_id = ${place_id}`
    } else if (subproject_id) {
      where = `subproject_id = ${subproject_id}`
    } else if (project_id) {
      where = `project_id = ${project_id}`
    }
    return where
  }, [place_id, place_id2, project_id, subproject_id])

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM charts${where && ` WHERE ${where}`} ORDER BY label ASC`,
  )
  const charts = result?.rows ?? []

  const add = useCallback(async () => {
    const idToAdd = place_id2
      ? { place_id2 }
      : place_id
      ? { place_id }
      : subproject_id
      ? { subproject_id }
      : { project_id }
    const data = createChart(idToAdd)
    const columns = Object.keys(data)
    const values = Object.values(data).join("','")
    const sql = `INSERT INTO charts (${columns}) VALUES ('${values}')`
    await db.query(sql)
    navigate({ pathname: data.chart_id, search: searchParams.toString() })
  }, [
    db,
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
          <Row
            key={chart_id}
            label={label ?? chart_id}
            to={chart_id}
          />
        ))}
      </div>
    </div>
  )
})
