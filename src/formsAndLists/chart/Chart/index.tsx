import { useEffect, useState, useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { buildData } from './buildData/index.ts'
import { SingleChart } from './Chart.tsx'
import { NotFound } from '../../../components/NotFound.tsx'
import styles from './index.module.css'

import type Charts from '../../../models/public/Charts.ts'
import type ChartSubjects from '../../../models/public/ChartSubjects.ts'

export const Chart = ({ from }) => {
  const { projectId, subprojectId, chartId } = useParams({ from })

  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT 
      c.*,
      (SELECT json_agg(cs ORDER BY cs.sort, cs.name) 
       FROM chart_subjects cs 
       WHERE cs.chart_id = c.chart_id) as subjects
    FROM charts c 
    WHERE c.chart_id = $1`,
    [chartId],
  )
  const chart: Charts = result?.rows?.[0]
  const subjects: ChartSubjects[] = useMemo(
    () => chart?.subjects ?? [],
    [chart],
  )

  const [data, setData] = useState({ data: [], names: [] })

  useEffect(() => {
    if (!subjects) return
    if (!chart) return
    if (!subjects.length) return

    const run = async () => {
      const data = await buildData({
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
    return (
      <NotFound
        table="Chart"
        id={chartId}
      />
    )
  }

  if (!chart || !subjects) return null

  // const typeOfChart =
  //   subjects.length === 1 && data.years.length === 1 ? 'Pie' : 'Area'

  return (
    <>
      <div className={styles.titleRow}>{chart.title}</div>
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
}
