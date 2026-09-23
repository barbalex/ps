import { useIntl } from 'react-intl'
import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownFieldOptions } from '../../components/shared/DropdownFieldOptions.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import type SubprojectReports from '../../models/public/SubprojectReports.ts'

import '../../form.css'

type Props = {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  row: Record<string, any> | SubprojectReports
  orIndex?: number
  from: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  validations?: Record<string, { state: 'error'; message: string }>
}

// this form is rendered from a parent or outlet
export const SubprojectReportForm = ({
  onChange,
  row,
  orIndex,
  from,
  autoFocusRef,
  validations = {},
}: Props) => {
  const { formatMessage } = useIntl()
  const { subprojectId } = useParams({ strict: false })

  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row as Record<string, unknown>)

  // designs to choose from: the report's own design, else the active one
  const designsRes = useLiveQuery(
    `SELECT subproject_report_design_id, name, active
     FROM subproject_report_designs
     WHERE project_id = (SELECT project_id FROM subprojects WHERE subproject_id = $1)
     ORDER BY name`,
    [subprojectId],
  )
  const designs = (designsRes?.rows ?? []) as {
    subproject_report_design_id: string
    name: string | null
    active: boolean | null
  }[]
  const designOptions = designs.map((d) => ({
    value: d.subproject_report_design_id,
    label: d.name ?? d.subproject_report_design_id,
  }))
  const activeDesignId = designs.find((d) => d.active)?.subproject_report_design_id

  return (
    <>
      {designOptions.length > 1 && (
        <DropdownFieldOptions
          label={formatMessage({
            id: 'bGfDeF',
            defaultMessage: 'Berichts-Design',
          })}
          name="subproject_report_design_id"
          options={designOptions}
          value={row.subproject_report_design_id ?? activeDesignId ?? undefined}
          onChange={onChange}
          validationState={validations?.subproject_report_design_id?.state}
          validationMessage={
            validations?.subproject_report_design_id?.message ??
            formatMessage({
              id: 'bGgEfG',
              defaultMessage:
                'Design, mit dem der Bericht gedruckt wird. Standard: das aktive Design',
            })
          }
        />
      )}
      <TextField
        label={formatMessage({ id: 'bB4FgH', defaultMessage: 'Jahr' })}
        name="year"
        type="number"
        value={row.year ?? ''}
        onChange={onChange}
        validationState={validations?.year?.state}
        validationMessage={validations?.year?.message}
      />
      <Jsonb
        table="subproject_reports"
        idField="subproject_report_id"
        id={row.subproject_report_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
        autoFocus
        ref={autoFocusRef as unknown as React.Ref<HTMLDivElement>}
      />
    </>
  )
}
