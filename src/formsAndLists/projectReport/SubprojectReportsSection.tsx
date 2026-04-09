import { useState, useEffect } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { Render } from '@puckeditor/core'

import { TextField } from '../../components/shared/TextField.tsx'
import { buildData } from '../chart/Chart/buildData/index.ts'
import { SingleChart } from '../chart/Chart/Chart.tsx'
import styles from './SubprojectReportsSection.module.css'

import '@puckeditor/core/puck.css'

interface FieldDef {
  name: string
  field_label: string | null
}

interface SubprojectReportItemProps {
  subprojectId: string
  year: number | null
  fields: FieldDef[]
}

// Renders a single subproject's report for a given year, using its active design if available
const SubprojectReportItem = ({
  subprojectId,
  year,
  fields,
}: SubprojectReportItemProps) => {
  const [chartDataMap, setChartDataMap] = useState<Record<string, unknown>>({})

  const res = useLiveQuery(
    `SELECT
      sr.*,
      (SELECT design FROM subproject_report_designs
       WHERE project_id = (SELECT project_id FROM subprojects WHERE subproject_id = sr.subproject_id) AND active = true
       LIMIT 1) as design,
      (SELECT json_agg(c) FROM (
        SELECT c.chart_id, c.name, c.subjects_single,
          (SELECT json_agg(cs ORDER BY cs.sort, cs.name)
           FROM chart_subjects cs
           WHERE cs.chart_id = c.chart_id) as subjects
        FROM charts c
        WHERE c.subproject_id = sr.subproject_id
        ORDER BY c.name
      ) c) as charts
    FROM subproject_reports sr
    WHERE sr.subproject_id = $1 AND sr.year = $2
    LIMIT 1`,
    [subprojectId, year],
  )

  const report = res?.rows?.[0]
  const charts = report?.charts ?? []
  const design = report?.design
  const jsonbData = (report?.data as Record<string, unknown>) ?? {}
  const chartsJson = JSON.stringify(charts)

  useEffect(() => {
    const parsedCharts = JSON.parse(chartsJson)
    if (!parsedCharts.length) return

    const buildAllChartData = async () => {
      const dataMap: Record<string, unknown> = {}
      for (const chart of parsedCharts) {
        if (!chart.subjects?.length) continue
        const data = await buildData({
          chart,
          subjects: chart.subjects,
          subproject_id: subprojectId,
        })
        dataMap[chart.chart_id] = data
      }
      setChartDataMap(dataMap)
    }

    buildAllChartData()
  }, [chartsJson, subprojectId])

  if (!res) return <div className={styles.loading}>Loading...</div>
  if (!report) {
    return (
      <div className={styles.emptyItalic}>
        No report for year {year ?? '–'}.
      </div>
    )
  }

  // Build Puck config from field definitions and chart data
  const components: Record<string, unknown> = {}

  fields.forEach((field) => {
    const componentName = `${field.name}Field`
    components[componentName] = {
      fields: { value: { type: 'textarea' } },
      defaultProps: { value: '' },
      render: () => {
        const fieldValue = (jsonbData[field.name] as string) ?? ''
        return (
          <div className={styles.fieldWrapper}>
            <TextField
              label={field.field_label || field.name}
              name={field.name}
              value={fieldValue}
              readOnly
            />
          </div>
        )
      },
    }
  })

  charts.forEach((chart) => {
    const componentName = `chart_${chart.chart_id}`
    components[componentName] = {
      label: chart.name || 'Chart',
      fields: {},
      defaultProps: {},
      render: () => {
        const data = (chartDataMap[chart.chart_id] as {
          data: unknown[]
          names: string[]
        }) ?? { data: [], names: [] }
        return (
          <div className={styles.chartWrapper}>
            <div className={styles.chartTitle}>
              {chart.name}
            </div>
            {chart.subjects_single === true ? (
              chart.subjects?.map((subject) => (
                <SingleChart
                  key={subject.chart_subject_id}
                  chart={chart}
                  subjects={[subject]}
                  data={data}
                  synchronized={true}
                />
              ))
            ) : (
              <SingleChart
                chart={chart}
                subjects={chart.subjects ?? []}
                data={data}
              />
            )}
          </div>
        )
      },
    }
  })

  const config = { components }

  if (design) {
    return <Render config={config} data={design} />
  }

  // Fallback: render fields directly when no design is configured
  return (
    <div>
      {fields.map((field) => {
        const value = (jsonbData[field.name] as string) ?? ''
        if (!value) return null
        return (
          <TextField
            key={field.name}
            label={field.field_label || field.name}
            name={field.name}
            value={value}
            readOnly
          />
        )
      })}
    </div>
  )
}

interface SubprojectReportsSectionProps {
  projectId: string
  year: number | null
}

// Renders all subprojects with their reports for the given year
export const SubprojectReportsSection = ({
  projectId,
  year,
}: SubprojectReportsSectionProps) => {
  const res = useLiveQuery(
    `SELECT
      sp.subproject_id,
      sp.name as subproject_name,
      (SELECT json_agg(f) FROM (
        SELECT name, field_label
        FROM fields
        WHERE table_name = 'subproject_reports'
          AND project_id = sp.project_id
        ORDER BY name
      ) f) as fields
    FROM subprojects sp
    WHERE sp.project_id = $1
    ORDER BY sp.name`,
    [projectId],
  )

  const subprojects = res?.rows ?? []

  if (!res) {
    return <div className={styles.loading}>Loading subproject reports...</div>
  }

  if (!subprojects.length) {
    return (
      <div className={styles.emptyItalic}>
        No subprojects found.
      </div>
    )
  }

  return (
    <div>
      {subprojects.map((sp) => (
        <div key={sp.subproject_id} className={styles.subprojectSection}>
          <h3 className={styles.subprojectHeader}>
            {sp.subproject_name}
          </h3>
          <SubprojectReportItem
            subprojectId={sp.subproject_id}
            year={year}
            fields={sp.fields ?? []}
          />
        </div>
      ))}
    </div>
  )
}
