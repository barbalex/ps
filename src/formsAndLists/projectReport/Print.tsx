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
import { buildData } from '../chart/Chart/buildData/index.ts'
import { SingleChart } from '../chart/Chart/Chart.tsx'
import { SubprojectReportsSection } from './SubprojectReportsSection.tsx'
import type ProjectReports from '../../models/public/ProjectReports.ts'
import styles from './Print.module.css'

import '../../form.css'
import '@puckeditor/core/puck.css'

export const ProjectReportPrint = ({ from }) => {
  const { projectReportId, projectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const [chartDataMap, setChartDataMap] = useState({})
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
  const row: ProjectReports = res?.rows?.[0] ?? {}
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
      const dataMap = {}
      for (const chart of parsedCharts) {
        if (!chart.subjects || !chart.subjects.length) continue
        const data = await buildData({
          chart,
          subjects: chart.subjects,
          project_id: projectId,
        })
        dataMap[chart.chart_id] = data
      }
      setChartDataMap(dataMap)
    }

    buildAllChartData()
  }, [chartsJson, projectId])

  // Build Puck config from fields with actual data
  const components = {}
  fields.forEach((field) => {
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
        const fieldValue = jsonbData[field.name] ?? ''
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
  charts.forEach((chart) => {
    const componentName = `chart_${chart.chart_id}`

    components[componentName] = {
      label: chart.name || 'Chart',
      fields: {},
      defaultProps: {},
      render: () => {
        const data = chartDataMap[chart.chart_id] ?? { data: [], names: [] }
        return (
          <div className={styles.fieldWrapper}>
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

  // SubprojectReports block — renders all subproject reports for this project
  components['SubprojectReports'] = {
    label: 'Subproject Reports',
    fields: {},
    defaultProps: {},
    render: () => (
      <SubprojectReportsSection projectId={projectId} year={row.year ?? null} />
    ),
  }

  const config = { components }

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE project_reports SET ${name} = $1 WHERE project_report_id = $2`,
        [value, projectReportId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        {design && <Render config={config} data={design} />}
        {!design && <div>{formatMessage({ id: 'bB6JkL', defaultMessage: 'Kein Berichts-Design für dieses Projekt gefunden.' })}</div>}
      </div>
    </div>
  )
}
