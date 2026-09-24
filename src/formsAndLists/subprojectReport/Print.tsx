import { useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { Render } from '@puckeditor/core'
import { useIntl } from 'react-intl'

import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { languageAtom } from '../../store.ts'
import { subprojectNameSingularExpr } from '../../modules/subprojectNameCols.ts'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import { normalizePuckDesign } from '../../modules/normalizePuckDesign.ts'
import { useReportVersions } from '../../components/shared/reportVersions.ts'
import styles from './Print.module.css'
import { buildData } from '../chart/Chart/buildData/index.ts'
import { groupSeriesBySubject } from '../chart/Chart/buildData/index.ts'
import { SingleChart } from '../chart/Chart/Chart.tsx'
import {
  SubprojectReportContext,
  WrappingTextField,
  buildDataComponents,
} from './reportComponents.tsx'

import '../../form.css'

export const SubprojectReportPrint = ({ from }: { from: string }) => {
  const { subprojectReportId, projectId, subprojectId } = useParams({ strict: false })
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const [chartDataMap, setChartDataMap] = useState<Record<string, any>>({})

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT 
      sr.*,
      (SELECT ${subprojectNameSingularExpr(language, 'p')} FROM projects p WHERE p.project_id = (SELECT project_id FROM subprojects WHERE subproject_id = sr.subproject_id)) AS subproject_name_singular,
      (SELECT json_agg(f) FROM (
        SELECT field_id, name, field_label, field_type_id, widget_type_id 
        FROM fields 
        WHERE table_name = 'subproject_reports' 
        ORDER BY name
      ) f) as fields,
      (SELECT json_agg(c) FROM (
        SELECT c.chart_id, c.name, c.subjects_single,
          (SELECT json_agg(cs ORDER BY cs.sort, cs.name)
           FROM chart_subjects cs
           WHERE cs.chart_id = c.chart_id) as subjects
        FROM charts c
        WHERE c.subproject_id = sr.subproject_id
          -- project-level chart templates compute against this subproject
          OR (c.for_subprojects AND c.subproject_id IS NULL
              AND c.project_id = (SELECT project_id FROM subprojects WHERE subproject_id = sr.subproject_id))
        ORDER BY c.name
      ) c) as charts,
      (SELECT design FROM subproject_report_designs
       WHERE subproject_report_design_id = sr.subproject_report_design_id) as design,
      (SELECT design FROM subproject_report_designs
       WHERE project_id = (SELECT project_id FROM subprojects WHERE subproject_id = sr.subproject_id)
       AND active = true
       LIMIT 1) as active_design
    FROM subproject_reports sr
    WHERE subproject_report_id = $1`,
    [subprojectReportId],
  )
  const row = (res?.rows?.[0] ?? {}) as Record<string, any>
  const subprojectNameSingular = row?.subproject_name_singular as
    | string
    | undefined
  const jsonbData = jsonbDataFromRow(row)
  const design = row?.design ?? row?.active_design
  const fields = row?.fields ?? []
  const charts = row?.charts ?? []
  const chartsJson = JSON.stringify(charts)
  // server-side historized versions of the art's undated rows (online only,
  // cached by react-query) — place series count as of each chart year
  const { data: versions } = useReportVersions(subprojectId)

  // Build chart data for all charts
  useEffect(() => {
    const parsedCharts = JSON.parse(chartsJson)
    if (!parsedCharts.length) return

    const buildAllChartData = async () => {
      const dataMap: Record<string, unknown> = {}
      for (const chart of parsedCharts) {
        if (!chart.subjects || !chart.subjects.length) continue
        const data = await buildData({
          chart,
          subjects: chart.subjects,
          subproject_id: (subprojectId)!,
          project_id: projectId,
          db,
          placesVersions: versions?.places,
          subprojectsVersions: versions?.subprojects,
          reportYear: row.year as number | null,
        })
        dataMap[chart.chart_id] = data
      }
      setChartDataMap(dataMap)
      if (import.meta.env.DEV) {
        console.log(
          '[report-charts]',
          Object.entries(dataMap).map(([chartId, data]) => {
            const chartData = data as {
              series?: { key: string }[]
              data?: Record<string, unknown>[]
            }
            return {
              chartId,
              series: chartData.series?.map((singleSeries) => ({
                key: singleSeries.key,
                first: chartData.data?.[0]?.[singleSeries.key],
                last: chartData.data?.[chartData.data.length - 1]?.[singleSeries.key],
              })),
            }
          }),
        )
      }
    }

    buildAllChartData()
  }, [chartsJson, subprojectId, projectId, versions])

  // Build Puck config from fields with actual data
  const components: Record<string, any> = Object.assign(
    {},
    buildDataComponents(),
  )
  fields.forEach((field: any) => {
    const componentName = `${field.name}Field`

    components[componentName] = {
      fields: {
        value: {
          type: 'textarea',
        },
      },
      defaultProps: {
        value: '',
      },
      render: () => {
        // Always read from the current report's jsonbData, not from the saved design value
        const fieldValue = (jsonbData[field.name] ?? '') as string
        // like apf2: empty fields are omitted from the printed report
        if (!fieldValue) return null
        return (
          <div className={styles.fieldWrapper}>
            <WrappingTextField
              label={field.field_label || field.name}
              value={fieldValue}
            />
          </div>
        )
      },
    }
  })

  // Add chart components
  charts.forEach((chart: any) => {
    const componentName = `chart_${chart.chart_id}`

    components[componentName] = {
      label: chart.name || 'Chart',
      fields: {},
      defaultProps: {},
      render: () => {
        const data = chartDataMap[chart.chart_id] ?? { data: [], years: [], series: [] }
        return (
          <div className={styles.fieldWrapper}>
            <div className={styles.chartTitle}>{chart.name}</div>
            {chart.subjects_single === true ? (
              groupSeriesBySubject(data.series ?? []).map((series) => (
                <SingleChart
                  key={series[0]?.subject.chart_subject_id}
                  chart={chart}
                  series={series}
                  data={data.data}
                  synchronized={true}
                />
              ))
            ) : (
              <SingleChart
                chart={chart}
                series={data.series ?? []}
                data={data.data}
              />
            )}
          </div>
        )
      },
    }
  })

  const config = { components }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Report" id={subprojectReportId} />
  }

  return (
    <div className="form-outer-container">
      <div className="print-hide">
        <Header from={from} />
      </div>
      <div className="form-container">
        <SubprojectReportContext.Provider
          value={{
            projectId: row.project_id,
            subprojectId: row.subproject_id,
            year: row.year,
          }}
        >
          {design && fields.length > 0 && (
            <Render config={config} data={normalizePuckDesign(design)} />
          )}
        </SubprojectReportContext.Provider>
        {(!design || fields.length === 0) && (
          <div>
            {formatMessage(
              {
                id: 'bCIjKl',
                defaultMessage:
                  'Kein Berichts-Design gefunden. Du musst zuerst ein {subproject}-Bericht-Design erstellen.',
              },
              { subproject: subprojectNameSingular ?? 'Subprojekt' },
            )}
          </div>
        )}
      </div>
    </div>
  )
}
