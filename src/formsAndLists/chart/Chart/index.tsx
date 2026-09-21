import { useEffect, useState, useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { buildData } from './buildData/index.ts'
import type { ChartData, ChartSeries } from './buildData/index.ts'
import { SingleChart } from './Chart.tsx'
import { NotFound } from '../../../components/NotFound.tsx'
import styles from './index.module.css'

import type Charts from '../../../models/public/Charts.ts'
import type ChartSubjects from '../../../models/public/ChartSubjects.ts'

export const Chart = ({ }: { from?: string }) => {
  const { projectId, subprojectId, chartId } = useParams({ strict: false })

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
  const chart = result?.rows?.[0] as Charts | undefined
  const subjects: ChartSubjects[] = useMemo(
    () =>
      (chart as { subjects?: ChartSubjects[] } | undefined)?.subjects ?? [],
    [chart],
  )

  const [chartData, setChartData] = useState<ChartData>({
    data: [],
    years: [],
    series: [],
  })

  useEffect(() => {
    if (!chart) return
    if (!subjects.length) return

    const run = async () => {
      const chartData = await buildData({
        chart,
        subjects,
        subproject_id: subprojectId!,
        project_id: projectId,
        db,
      })
      setChartData(chartData)
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

  // subjects_single: one chart per subject — but a subject that splits into
  // several series (e.g. per population) keeps its series together
  const seriesBySubject = new Map<string, ChartSeries[]>()
  for (const singleSeries of chartData.series) {
    const subjectId = singleSeries.subject.chart_subject_id
    if (!seriesBySubject.has(subjectId)) seriesBySubject.set(subjectId, [])
    seriesBySubject.get(subjectId)!.push(singleSeries)
  }

  return (
    <>
      <div className={styles.titleRow}>{chart.name}</div>
      {chart.subjects_single === true ?
        [...seriesBySubject.values()].map((series) => (
          <SingleChart
            key={series[0]?.subject.chart_subject_id}
            chart={chart}
            series={series}
            data={chartData.data}
            synchronized={true}
          />
        ))
      : <SingleChart
          chart={chart}
          series={chartData.series}
          data={chartData.data}
        />
      }
    </>
  )
}
