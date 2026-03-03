import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { Puck, Config } from '@puckeditor/core'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'

import type ProjectReportDesigns from '../../models/public/ProjectReportDesigns.ts'

import '@puckeditor/core/puck.css'

export const Form = ({ autoFocusRef, from }) => {
  const { projectReportDesignId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT 
      prd.*,
      (SELECT json_agg(f) FROM (
        SELECT field_id, name, field_label, field_type_id, widget_type_id 
        FROM fields 
        WHERE table_name = 'project_reports'
          AND project_id = prd.project_id
        ORDER BY name
      ) f) as fields,
      (SELECT json_agg(c) FROM (
        SELECT c.chart_id, c.name, c.label, c.subjects_single,
          (SELECT json_agg(cs ORDER BY cs.sort, cs.name) 
           FROM chart_subjects cs 
           WHERE cs.chart_id = c.chart_id) as subjects
        FROM charts c
        WHERE c.project_id = prd.project_id
        ORDER BY c.name
      ) c) as charts,
      (SELECT data FROM project_reports 
       WHERE project_id = prd.project_id 
       ORDER BY year DESC 
       LIMIT 1) as report_data
    FROM project_report_designs prd
    WHERE project_report_design_id = $1`,
    [projectReportDesignId],
  )
  const row: ProjectReportDesigns | undefined = res?.rows?.[0]
  const fields = row?.fields ?? []
  const charts = row?.charts ?? []
  const reportData = row?.report_data ?? {}

  // Build Puck config from fields with actual data
  const components = {}
  const categories = {
    fields: { components: [] },
    charts: { components: [] },
  }

  fields.forEach((field) => {
    const componentName = `${field.name}Field`
    const fieldValue = reportData[field.name] ?? ''

    components[componentName] = {
      label: field.field_label,
      fields: {
        value: {
          type: 'textarea',
        },
      },
      defaultProps: {
        value: fieldValue,
      },
      render: ({ value }) => {
        return (
          <div style={{ marginBottom: 16 }}>
            <TextField
              label={field.field_label || field.name}
              name={field.name}
              value={value}
              readOnly
            />
          </div>
        )
      },
    }
    categories.fields.components.push(componentName)
  })

  // Add chart components
  charts.forEach((chart) => {
    const componentName = `chart_${chart.chart_id}`

    components[componentName] = {
      label: chart.label,
      fields: {},
      defaultProps: {},
      render: () => {
        return (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: '1.2em',
                fontWeight: 'bold',
                marginBottom: 8,
              }}
            >
              {chart.label}
            </div>
            <div style={{ color: '#999', fontStyle: 'italic' }}>
              Chart data available in report view
            </div>
          </div>
        )
      },
    }
    categories.charts.components.push(componentName)
  })

  const config: Config = { components, categories }

  const onActiveChange = async (e, data) => {
    const { value } = getValueFromChange(e, data)
    if (row.active === value) return

    try {
      if (value === true) {
        // Deactivate all other designs for this project first, then activate this one
        const prevActive = await db.query<ProjectReportDesigns>(
          `SELECT * FROM project_report_designs WHERE project_id = $1 AND project_report_design_id <> $2 AND active = TRUE`,
          [row.project_id, projectReportDesignId],
        )
        await db.query(
          `UPDATE project_report_designs SET active = FALSE WHERE project_id = $1 AND project_report_design_id <> $2`,
          [row.project_id, projectReportDesignId],
        )
        for (const prevRow of prevActive.rows) {
          addOperation({
            table: 'project_report_designs',
            rowIdName: 'project_report_design_id',
            rowId: prevRow.project_report_design_id,
            operation: 'update',
            draft: { active: false },
            prev: { ...prevRow },
          })
        }
      }
      await db.query(
        `UPDATE project_report_designs SET active = $1 WHERE project_report_design_id = $2`,
        [value, projectReportDesignId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        active: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { active: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'project_report_designs',
      rowIdName: 'project_report_design_id',
      rowId: row.project_report_design_id,
      operation: 'update',
      draft: { active: value },
      prev: { ...row },
    })
  }

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE project_report_designs SET ${name} = $1 WHERE project_report_design_id = $2`,
        [value, projectReportDesignId],
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
      table: 'project_report_designs',
      rowIdName: 'project_report_design_id',
      rowId: row.project_report_design_id,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const onPuckChange = async (data) => {
    try {
      await db.query(
        `UPDATE project_report_designs SET design = $1 WHERE project_report_design_id = $2`,
        [JSON.stringify(data), projectReportDesignId],
      )
      addOperation({
        table: 'project_report_designs',
        rowIdName: 'project_report_design_id',
        rowId: row.project_report_design_id,
        operation: 'update',
        draft: { design: data },
        prev: { ...row },
      })
    } catch (error) {
      console.error('Error saving design:', error)
    }
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Project Report Design" id={projectReportDesignId} />
  }

  return (
    <div className="form-container">
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <SwitchField
        label="Active"
        name="active"
        value={row.active ?? false}
        onChange={onActiveChange}
        validationState={validations?.active?.state ?? 'success'}
        validationMessage={
          validations?.active?.message ??
          'No more than one design can be active at once'
        }
      />
      {(fields.length > 0 || charts.length > 0) && (
        <Puck
          config={config}
          data={row.design ?? { content: [] }}
          onChange={onPuckChange}
        >
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'stretch',
              gap: 16,
            }}
          >
            <div
              style={{
                borderRight: '1px solid #eee',
                paddingRight: 8,
                overflow: 'auto',
                scrollbarWidth: 'thin',
              }}
            >
              <Puck.Components />
            </div>
            <div
              style={{
                position: 'relative',
                minHeight: 0,
                overflow: 'auto',
                scrollbarWidth: 'thin',
                flexGrow: 1,
              }}
            >
              {(!row.design?.content || row.design.content.length === 0) && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '1.2em',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                >
                  Drag fields and charts into the design
                </div>
              )}
              <Puck.Preview />
            </div>
          </div>
        </Puck>
      )}
      {fields.length === 0 && charts.length === 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 60,
            color: '#999',
            fontSize: '1.2em',
          }}
        >
          No fields or charts found. Please add fields or charts first.
        </div>
      )}
    </div>
  )
}
