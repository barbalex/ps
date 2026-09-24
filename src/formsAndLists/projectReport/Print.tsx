import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { Render } from '@puckeditor/core'
import { useIntl } from 'react-intl'

import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import { normalizePuckDesign } from '../../modules/normalizePuckDesign.ts'
import { buildData } from '../chart/Chart/buildData/index.ts'
import { groupSeriesBySubject } from '../chart/Chart/buildData/index.ts'
import { SingleChart } from '../chart/Chart/Chart.tsx'
import { SubprojectReportsSection } from './SubprojectReportsSection.tsx'
import styles from './Print.module.css'

import '../../form.css'

export const ProjectReportPrint = ({ from }: { from: string }) => {
  const { projectReportId, projectId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})
  const [chartDataMap, setChartDataMap] = useState<Record<string, any>>({})
  const { formatMessage } = useIntl()

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT 
      pr.*,
      (SELECT json_agg(f) FROM (
        SELECT field_id, name, field_label, field_type_id, widget_type_id 
        FROM fields 
        WHERE table_name = 'project_reports' 
          AND project_id = pr.project_id
        ORDER BY name
      ) f) as fields,
      (SELECT json_agg(c) FROM (
        SELECT c.chart_id, c.name, c.subjects_single,
          (SELECT json_agg(cs ORDER BY cs.sort, cs.name) 
           FROM chart_subjects cs 
           WHERE cs.chart_id = c.chart_id) as subjects
        FROM charts c
        WHERE c.project_id = pr.project_id
          -- subproject templates describe subprojects, not the project
          AND NOT c.for_subprojects
        ORDER BY c.name
      ) c) as charts,
      (SELECT design FROM project_report_designs 
       WHERE project_id = pr.project_id 
         AND active = true 
       LIMIT 1) as design
    FROM project_reports pr
    WHERE project_report_id = $1`,
    [projectReportId],
  )
  const row = (res?.rows?.[0] ?? {}) as Record<string, any>
  const jsonbData = jsonbDataFromRow(row)
  const design = row?.design
  const fields = row?.fields ?? []
  const charts = row?.charts ?? []
  const chartsJson = JSON.stringify(charts)

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
          project_id: projectId,
          subproject_id: undefined as unknown as string,
          db,
        })
        dataMap[chart.chart_id] = data
      }
      setChartDataMap(dataMap)
    }

    buildAllChartData()
  }, [chartsJson, projectId])

  // Build Puck config from fields with actual data
  const components: Record<string, any> = {}
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
            <div className={styles.chartTitle}>
              {chart.name}
            </div>
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

  // SubprojectReports block — renders all subproject reports for this project
  components['SubprojectReports'] = {
    label: 'Subproject Reports',
    fields: {},
    defaultProps: {},
    render: () => (
      <SubprojectReportsSection projectId={projectId!} year={row.year ?? null} />
    ),
  }

  const config = { components }

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    if ((row as Record<string, any>)[name] === value) return

    try {
      await db.query(
        `UPDATE project_reports SET ${name} = $1 WHERE project_report_id = $2`,
        [value, projectReportId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error instanceof Error ? error.message : String(error) },
      }))
      return
    }
    setValidations((prev) => {
       
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'project_reports',
      rowIdName: 'project_report_id',
      rowId: projectReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Report" id={projectReportId} />
  }

  return (
    <div className="form-outer-container">
      <div className="print-hide">
        <Header from={from} autoFocusRef={undefined} />
      </div>
      <div className="form-container">
        <div className="print-hide">
          <TextField
            label={formatMessage({ id: 'bB4FgH', defaultMessage: 'Jahr' })}
            name="year"
            type="number"
            value={row.year ?? ''}
            onChange={onChange}
            validationState={validations?.year?.state}
            validationMessage={validations?.year?.message}
          />
        </div>
        {design && <Render config={config} data={normalizePuckDesign(design)} />}
        {!design && <div>{formatMessage({ id: 'bB6JkL', defaultMessage: 'Kein Berichts-Design für dieses Projekt gefunden.' })}</div>}
      </div>
    </div>
  )
}
