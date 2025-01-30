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
  const { results: chartSubjects = [] } = useLiveQuery(
    db.chart_subjects.liveMany({
      where: { chart_id },
      orderBy: { label: 'asc' },
    }),
  )

  const addRow = useCallback(async () => {
    const data = createChartSubject({ chart_id })
    await db.chart_subjects.create({ data })
    navigate({
      pathname: data.chart_subject_id,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [chart_id, db.chart_subjects, navigate, searchParams])

  // TODO: get uploader css locally if it should be possible to upload charts
  // offline to sqlite
  return (
    <div className="list-view">
      <ListViewHeader
        title="Chart Subjects"
        tableName="chart subject"
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
