import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { Render } from '@puckeditor/core'

import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import { buildData } from '../chart/Chart/buildData/index.ts'
import { SingleChart } from '../chart/Chart/Chart.tsx'
import type SubprojectReports from '../../models/public/SubprojectReports.ts'

import '../../form.css'
import '@puckeditor/core/puck.css'

export const SubprojectReportPrint = ({ from }) => {
  const { subprojectReportId, projectId, subprojectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const [chartDataMap, setChartDataMap] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT 
      sr.*,
      (SELECT json_agg(f) FROM (
        SELECT field_id, name, field_label, field_type_id, widget_type_id 
        FROM fields 
        WHERE table_name = 'subproject_reports' 
        ORDER BY name
      ) f) as fields,
      (SELECT json_agg(c) FROM (
        SELECT c.chart_id, c.title, c.subjects_single,
          (SELECT json_agg(cs ORDER BY cs.sort, cs.name) 
           FROM chart_subjects cs 
           WHERE cs.chart_id = c.chart_id) as subjects
        FROM charts c
        WHERE c.subproject_id = sr.subproject_id
        ORDER BY c.title
      ) c) as charts,
      (SELECT design FROM subproject_report_designs 
       WHERE subproject_id = sr.subproject_id 
       LIMIT 1) as design
    FROM subproject_reports sr
    WHERE subproject_report_id = $1`,
    [subprojectReportId],
  )
  const row: SubprojectReports = res?.rows?.[0] ?? {}
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
          subproject_id: subprojectId,
          project_id: projectId,
        })
        dataMap[chart.chart_id] = data
      }
      setChartDataMap(dataMap)
    }

    buildAllChartData()
  }, [chartsJson, subprojectId, projectId])

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
          <div style={{ marginBottom: '16px' }}>
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
    const componentName = `${chart.title?.replace(/\s+/g, '') || chart.chart_id}Chart`

    components[componentName] = {
      fields: {},
      defaultProps: {},
      render: () => {
        const data = chartDataMap[chart.chart_id] ?? { data: [], names: [] }
        return (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '8px' }}>
              {chart.title}
            </div>
            {chart.subjects_single === true ?
              chart.subjects?.map((subject) => (
                <SingleChart
                  key={subject.chart_subject_id}
                  chart={chart}
                  subjects={[subject]}
                  data={data}
                  synchronized={true}
                />
              ))
            : <SingleChart
                chart={chart}
                subjects={chart.subjects ?? []}
                data={data}
              />
            }
          </div>
        )
      },
    }
  })

  const config = {
    components,
  }

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE subproject_reports SET ${name} = $1 WHERE subproject_report_id = $2`,
        [value, subprojectReportId],
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
      table: 'subproject_reports',
      rowIdName: 'subproject_report_id',
      rowId: subprojectReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Report"
        id={subprojectReportId}
      />
    )
  }

  return (
    <>
      <style>{`
        @media print {
          .print-hide {
            display: none !important;
          }
        }
      `}</style>
      <div className="form-outer-container">
        <div className="print-hide">
          <Header from={from} />
        </div>
        <div className="form-container">
          <div className="print-hide">
            <TextField
              label="Year"
              name="year"
              type="number"
              value={row.year ?? ''}
              onChange={onChange}
              validationState={validations.year?.state}
              validationMessage={validations.year?.message}
            />
          </div>
          {design && fields.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <Render
                config={config}
                data={design}
              />
            </div>
          )}
          {(!design || fields.length === 0) && (
            <div>No report design found for this subproject.</div>
          )}
        </div>
      </div>
    </>
  )
}
