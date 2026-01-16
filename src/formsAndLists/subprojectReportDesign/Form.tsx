import { useState, useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { Puck } from '@puckeditor/core'

import { TextField } from '../../components/shared/TextField.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'

import type SubprojectReportDesigns from '../../models/public/SubprojectReportDesigns.ts'

import '@puckeditor/core/puck.css'

export const Form = ({ autoFocusRef, from }) => {
  const { subprojectReportDesignId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM subproject_report_designs WHERE subproject_report_design_id = $1`,
    [subprojectReportDesignId],
  )
  const row: SubprojectReportDesigns | undefined = res?.rows?.[0]

  // Query fields seeded for subproject_reports
  const fieldsRes = useLiveQuery(
    `SELECT field_id, name, field_label, field_type_id, widget_type_id 
     FROM fields 
     WHERE table_name = 'subproject_reports' 
     ORDER BY name`,
  )
  const fields = useMemo(() => fieldsRes?.rows ?? [], [fieldsRes?.rows])

  // Build Puck config from fields
  const config = useMemo(() => {
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
        render: ({ value }) => {
          return (
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                }}
              >
                {field.field_label || field.name}
              </label>
              <div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>
            </div>
          )
        },
      }
    })

    return {
      components,
    }
  }, [fields])

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE subproject_report_designs SET ${name} = $1 WHERE subproject_report_design_id = $2`,
        [value, subprojectReportDesignId],
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
      table: 'subproject_report_designs',
      rowIdName: 'subproject_report_design_id',
      rowId: row.subproject_report_design_id,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const onPuckChange = async (data) => {
    try {
      await db.query(
        `UPDATE subproject_report_designs SET design = $1 WHERE subproject_report_design_id = $2`,
        [JSON.stringify(data), subprojectReportDesignId],
      )
      addOperation({
        table: 'subproject_report_designs',
        rowIdName: 'subproject_report_design_id',
        rowId: row.subproject_report_design_id,
        operation: 'update',
        draft: { design: data },
        prev: { ...row },
      })
    } catch (error) {
      console.error('Error saving design:', error)
    }
  }

  if (!res || !fieldsRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Subproject Report Design"
        id={subprojectReportDesignId}
      />
    )
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
        validationState={validations.name?.state}
        validationMessage={validations.name?.message}
      />
      {fields.length > 0 && (
        <div style={{ marginTop: '20px', height: 'calc(100vh - 200px)' }}>
          <Puck
            config={config}
            data={row.design ?? { content: [], root: {} }}
            onChange={onPuckChange}
          />
        </div>
      )}
      {fields.length === 0 && (
        <div>
          No fields found for subproject_reports. Please seed the fields first.
        </div>
      )}
    </div>
  )
}
