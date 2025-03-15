import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { createChartSubject } from '../modules/createRows.ts'

import '../form.css'

export const Component = memo(() => {
  const { chart_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT chart_subject_id, label FROM chart_subjects WHERE chart_id = $1 ORDER BY label`,
    [chart_id],
    'chart_subject_id',
  )
  const isLoading = res === undefined
  const chartSubjects = res?.rows ?? []

  const addRow = useCallback(async () => {
    const res = await createChartSubject({ chart_id, db })
    const data = res?.rows?.[0]
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
        isLoading={isLoading}
        addRow={addRow}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {chartSubjects.map(({ chart_subject_id, label }) => (
              <Row
                key={chart_subject_id}
                label={label ?? chart_subject_id}
                to={chart_subject_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
