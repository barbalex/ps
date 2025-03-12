import { memo, useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router'
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

export const Chart = memo(() => {
  const { project_id, subproject_id, chart_id } = useParams()

  const db = usePGlite()

  // TODO: query subjects with charts
  const resultChart = useLiveIncrementalQuery(
    `SELECT * FROM charts WHERE chart_id = $1`,
    [chart_id],
    'chart_id',
  )
  const chart = resultChart?.rows?.[0]

  const resultSubjects = useLiveIncrementalQuery(
    `SELECT * FROM chart_subjects WHERE chart_id = $1 order by sort asc, name asc`,
    [chart_id],
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
        subproject_id,
        project_id,
      })
      setData(data)
    }
    run()
  }, [chart_id, chart, db, project_id, subjects, subproject_id])

  if (!chart || !subjects) return null

  // const typeOfChart =
  //   subjects.length === 1 && data.years.length === 1 ? 'Pie' : 'Area'

  return (
    <>
      <div style={titleRowStyle}>{chart.title}</div>
      {chart.subjects_single === true ? (
        subjects.map((subject) => (
          <SingleChart
            chart={chart}
            subjects={[subject]}
            data={data}
            synchronized={true}
          />
        ))
      ) : (
        <SingleChart
          chart={chart}
          subjects={subjects}
          data={data}
        />
      )}
    </>
  )
})
