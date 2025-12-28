import { useEffect, useState, useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { buildData } from './buildData/index.ts'
import { SingleChart } from './Chart.tsx'
import { NotFound } from '../../../components/NotFound.tsx'
import styles from './index.module.css'

export const Chart = ({ from }) => {
  const { projectId, subprojectId, chartId } = useParams({ from })

  const db = usePGlite()

  // TODO: query subjects with charts
  const resultChart = useLiveQuery(`SELECT * FROM charts WHERE chart_id = $1`, [
    chartId,
  ])
  const chart = resultChart?.rows?.[0]

  const resultSubjects = useLiveQuery(
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

  if (!chart) {
    return <NotFound table="Chart" id={chartId} />
  }

  if (!chart || !subjects) return null

  // const typeOfChart =
  //   subjects.length === 1 && data.years.length === 1 ? 'Pie' : 'Area'

  return (
    <>
      <div className={styles.titleRow}>{chart.title}</div>
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
        <SingleChart chart={chart} subjects={subjects} data={data} />
      )}
    </>
  )
}
