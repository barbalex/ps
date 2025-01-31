import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createChartSubject } from '../modules/createRows.ts'

import '../form.css'

export const Component = memo(() => {
  const { chart_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const results = useLiveQuery(
    `SELECT * FROM chart_subjects WHERE chart_id = ? ORDER BY label ASC`,
    [chart_id],
  )
  const chartSubjects = results?.rows ?? []

  const addRow = useCallback(async () => {
    const data = createChartSubject({ chart_id })
    const columns = Object.keys(data).join(',')
    const values = Object.values(data).join("','")
    const sql = `INSERT INTO chart_subjects (${columns}) VALUES ('${values}')`
    await db.query(sql)
    navigate({
      pathname: data.chart_subject_id,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [chart_id, db, navigate, searchParams])

  // TODO: get uploader css locally if it should be possible to upload charts
  // offline to sqlite
  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Chart Subjects"
        nameSingular="chart subject"
        tableName="chart_subjects"
        isFiltered={false}
        countFiltered={chartSubjects.length}
        addRow={addRow}
      />
      <div className="list-container">
        {chartSubjects.map(({ chart_subject_id, label }) => (
          <Row
            key={chart_subject_id}
            label={label ?? chart_subject_id}
            to={chart_subject_id}
          />
        ))}
      </div>
    </div>
  )
})
