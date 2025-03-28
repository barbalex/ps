import { memo, useEffect, useState, useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { buildData } from './buildData/index.ts'
import { SingleChart } from './Chart.tsx'

const titleRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
  fontWeight: 'bold',
}

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId/'

export const Chart = memo(() => {
  const { projectId, subprojectId, chartId } = useParams({ from })

  const db = usePGlite()

  // TODO: query subjects with charts
  const resultChart = useLiveIncrementalQuery(
    `SELECT * FROM charts WHERE chart_id = $1`,
    [chartId],
    'chart_id',
  )
  const chart = resultChart?.rows?.[0]

  const resultSubjects = useLiveIncrementalQuery(
    `SELECT * FROM chart_subjects WHERE chart_id = $1 order by sort, name`,
    [chartId],
  )
  const subjects = useMemo(() => resultSubjects?.rows ?? [], [resultSubjects])

  const [data, setData] = useState({ data: [], names: [] })

  useEffect(() => {
    if (!subjects) return
    if (!chart) return
    if (!subjects.length) return

    const run = async () => {
      const data = await buildData({
        db,
        chart,
        subjects,
        subproject_id: subprojectId,
        project_id: projectId,
      })
      setData(data)
    }
    run()
  }, [chartId, chart, db, projectId, subjects, subprojectId])

  if (!chart || !subjects) return null

  // const typeOfChart =
  //   subjects.length === 1 && data.years.length === 1 ? 'Pie' : 'Area'

  return (
    <>
      <div style={titleRowStyle}>{chart.title}</div>
      {chart.subjects_single === true ?
        subjects.map((subject) => (
          <SingleChart
            chart={chart}
            subjects={[subject]}
            data={data}
            synchronized={true}
          />
        ))
      : <SingleChart
          chart={chart}
          subjects={subjects}
          data={data}
        />
      }
    </>
  )
})
