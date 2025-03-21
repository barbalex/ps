import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { createChartSubject } from '../modules/createRows.ts'

import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/'

export const ChartSubjects = memo(() => {
  const { chartId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT chart_subject_id, label FROM chart_subjects WHERE chart_id = $1 ORDER BY label`,
    [chartId],
    'chart_subject_id',
  )
  const isLoading = res === undefined
  const chartSubjects = res?.rows ?? []

  const addRow = useCallback(async () => {
    const res = await createChartSubject({ chart_id: chartId, db })
    const data = res?.rows?.[0]
    navigate({
      to: data.chart_subject_id,
      params: (prev) => ({ ...prev, chartSubjectId: data.chart_subject_id }),
    })
    autoFocusRef.current?.focus()
  }, [chartId, db, navigate])

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
        {isLoading ?
          <Loading />
        : <>
            {chartSubjects.map(({ chart_subject_id, label }) => (
              <Row
                key={chart_subject_id}
                label={label ?? chart_subject_id}
                to={chart_subject_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
