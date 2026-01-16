import { useLiveQuery } from '@electric-sql/pglite-react'
import { Render } from '@puckeditor/core'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'
import '@puckeditor/core/puck.css'

// this form is rendered from a parent or outlet
export const SubprojectReportForm = ({
  onChange,
  row,
  orIndex,
  from,
  autoFocusRef,
  validations = {},
}) => {
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)

  // Query the design and fields for rendering
  const designRes = useLiveQuery(
    row?.subproject_id ?
      `SELECT 
          srd.design,
          (SELECT json_agg(f) FROM (
            SELECT field_id, name, field_label, field_type_id, widget_type_id 
            FROM fields 
            WHERE table_name = 'subproject_reports' 
            ORDER BY name
          ) f) as fields
        FROM subproject_report_designs srd
        WHERE srd.subproject_id = $1
        LIMIT 1`
    : null,
    [row?.subproject_id],
  )
  const design = designRes?.rows?.[0]?.design
  const fields = designRes?.rows?.[0]?.fields ?? []

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

  const config = {
    components,
  }

  return (
    <>
      <TextField
        label="Year"
        name="year"
        type="number"
        value={row.year ?? ''}
        onChange={onChange}
        validationState={validations.year?.state}
        validationMessage={validations.year?.message}
      />
      <Jsonb
        table="subproject_reports"
        idField="subproject_report_id"
        id={row.subproject_report_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
        autoFocus
        ref={autoFocusRef}
      />
      {design && fields.length > 0 && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h3>Report Design Preview</h3>
          <Render
            config={config}
            data={design}
          />
        </div>
      )}
    </>
  )
}
