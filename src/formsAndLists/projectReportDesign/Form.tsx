import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { Puck, Config } from '@puckeditor/core'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom, languageAtom } from '../../store.ts'
import { subprojectNameSingularExpr } from '../../modules/subprojectNameCols.ts'
import styles from './Form.module.css'

import type ProjectReportDesigns from '../../models/public/ProjectReportDesigns.ts'

import '@puckeditor/core/puck.css'

export const Form = ({ autoFocusRef, from }) => {
  const { projectReportDesignId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT 
      prd.*,
      (SELECT ${subprojectNameSingularExpr(language, '')} FROM projects WHERE project_id = prd.project_id) AS subproject_name_singular,
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
       LIMIT 1) as report_data,
      (SELECT EXISTS(
         SELECT 1 FROM subproject_report_designs 
         WHERE project_id = prd.project_id AND active = TRUE
       )) as has_active_subproject_design
    FROM project_report_designs prd
    WHERE project_report_design_id = $1`,
    [projectReportDesignId],
  )
  const row: ProjectReportDesigns | undefined = res?.rows?.[0]
  const fields = row?.fields ?? []
  const charts = row?.charts ?? []
  const reportData = row?.report_data ?? {}
  const hasActiveSubprojectDesign = row?.has_active_subproject_design ?? false
  const subprojectNameSingular = row?.subproject_name_singular
    ? `${row.subproject_name_singular}-${formatMessage({ id: 'bCAdEf', defaultMessage: 'Berichte' })}`
    : formatMessage({ id: 'bC1tUv', defaultMessage: 'Subprojekt-Berichte' })

  // Build Puck config from fields with actual data
  const components = {}
  const categories = {
    fields: {
      title: formatMessage({ id: 'bC8AbC', defaultMessage: 'Felder' }),
      components: [] as string[],
    },
    charts: {
      title: formatMessage({ id: 'bC9BcD', defaultMessage: 'Diagramme' }),
      components: [] as string[],
    },
    subproject_reports: {
      title: subprojectNameSingular,
      components: ['SubprojectReports'] as string[],
    },
  }

  // SubprojectReports is a single droppable block that renders all subproject reports
  components['SubprojectReports'] = {
    label: subprojectNameSingular,
    fields: {},
    defaultProps: {},
    render: () => (
      <div className={styles.subprojectReportsPlaceholder}>
        {formatMessage(
          {
            id: 'bC2uVw',
            defaultMessage:
              '{name} werden hier gerendert (ein Abschnitt pro Subprojekt)',
          },
          { name: subprojectNameSingular },
        )}
      </div>
    ),
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
          <div className={styles.fieldWrapper}>
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
          <div className={styles.chartWrapper}>
            <div className={styles.chartTitle}>{chart.label}</div>
            <div className={styles.chartHint}>
              {formatMessage({
                id: 'bC3vWx',
                defaultMessage:
                  'Diagramm-Daten sind in der Berichtsansicht verfügbar',
              })}
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
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'bB8NpQ', defaultMessage: 'Aktiv' })}
        name="active"
        value={row.active ?? false}
        onChange={onActiveChange}
        validationState={validations?.active?.state ?? 'success'}
        validationMessage={
          validations?.active?.message ??
          formatMessage({
            id: 'bB9OrS',
            defaultMessage: 'Es kann immer nur ein Design aktiv sein',
          })
        }
      />
      {
        <Puck
          key={language}
          config={config}
          data={row.design ?? { content: [] }}
          onChange={onPuckChange}
        >
          <div className={styles.editorLayout}>
            <div className={styles.editorSidebar}>
              {fields.length === 0 && (
                <div className={styles.warning}>
                  {formatMessage({
                    id: 'bC4wXy',
                    defaultMessage:
                      'Noch keine Felder — zuerst Felder zu diesem Projekt hinzufügen.',
                  })}
                </div>
              )}
              {charts.length === 0 && (
                <div className={styles.warning}>
                  {formatMessage({
                    id: 'bC5xYz',
                    defaultMessage:
                      'Noch keine Diagramme — zuerst Diagramme zu diesem Projekt hinzufügen.',
                  })}
                </div>
              )}
              {!hasActiveSubprojectDesign && (
                <div className={styles.warning}>
                  {formatMessage({
                    id: 'bC6yZa',
                    defaultMessage:
                      "Kein aktives Subprojekt-Bericht-Design — der Block 'Subprojekt-Berichte' wird leer sein.",
                  })}
                </div>
              )}
              <Puck.Components />
            </div>
            <div className={styles.editorPreview}>
              {(!row.design?.content || row.design.content.length === 0) && (
                <div className={styles.emptyPreview}>
                  {formatMessage({
                    id: 'bC7zaB',
                    defaultMessage:
                      'Felder, Diagramme und Subprojekt-Berichte in das Design ziehen',
                  })}
                </div>
              )}
              <Puck.Preview />
            </div>
          </div>
        </Puck>
      }
    </div>
  )
}
