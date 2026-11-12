import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation, useParams, useSearch } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { PrintRegular } from '@fluentui/react-icons'
import { MdArrowBack } from 'react-icons/md'

import { Jsonb } from '../Jsonb/index.tsx'
import type { FieldsWithTypes } from '../Jsonb/index.tsx'
import { designingAtom } from '../../../store.ts'

import { FormFromDesign } from './FormFromDesign.tsx'
import { FormDesignEditor } from './FormDesignEditor.tsx'
import { useFormDesignRow } from './useFormDesignRow.ts'
import { FormDesignToolbar } from './FormDesignToolbar.tsx'
import styles from './FormDesign.module.css'

const { Button } = fluentUiReactComponents

type Props = {
  table: string
  name?: string // json field name, defaults to 'data'
  idField: string
  id: string
  orIndex?: number // only for array of jsonb objects
  data: Record<string, unknown>
  autoFocus?: boolean
  ref?: React.Ref<HTMLDivElement>
  from?: string
  /** restrict rendering to these field_ids (field group of a table view) */
  fieldIds?: string[]
}

/**
 * Renders a form's jsonb fields — designed where a form design exists and
 * is active, auto-generated (Jsonb) otherwise. While the project is in
 * editing mode it shows the design controls (create/edit/toggle) and, via
 * the `formDesign` search param, the in-place design editor; the
 * `formPrint` search param renders the designed form read-only for
 * printing.
 *
 * The form target follows the url: the plain form of the table, or the
 * table view when the url carries a tableViewId.
 */
export const JsonbOrFormDesign = ({
  table,
  name: jsonFieldName = 'data',
  idField,
  id,
  orIndex,
  data = {},
  autoFocus = false,
  ref,
  from,
  fieldIds,
}: Props) => {
  const { projectId, placeId2, tableViewId } = useParams({
    strict: false,
  })
  const location = useLocation()
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false

  const { formDesign, formPrint } = useSearch({ strict: false }) as {
    formDesign?: string
    formPrint?: string
  }
  const currentSearch = useSearch({ strict: false }) as Record<string, unknown>

  // designed forms exist for project tables only — not for account tables,
  // filter forms or history comparisons
  const isFilter = location.pathname.endsWith('filter')
  const isHistory = from?.includes('histories') ?? false
  const eligible = !!projectId && !isFilter && !isHistory

  const designRow = useFormDesignRow({
    projectId: projectId ?? undefined,
    table,
    tableViewId,
  })

  const designApplies = !!designRow?.active && eligible

  // the field list of the table — only queried when a design is rendered
  // or designed; the auto-generated form queries its own (Jsonb)
  const needsFields = eligible && (!!formDesign || designApplies || !!formPrint)
  const useProjectId = !!projectId && table !== 'projects'
  const sql = `
      SELECT
        fields.*,
        field_types.name as field_type,
        widget_types.name as widget_type
      FROM fields
        INNER JOIN field_types USING (field_type_id)
        INNER JOIN widget_types USING (widget_type_id)
        LEFT JOIN unnest(
            ARRAY(SELECT sorted_field_ids FROM field_sorts WHERE table_name = fields.table_name and project_id = fields.project_id)
          ) WITH ORDINALITY t(field_id, ord) USING (field_id)
      WHERE
        fields.table_name = $1
        and fields.project_id ${useProjectId ? `= '${projectId}'` : 'IS NULL'}
        ${table === 'places' ? ` and level = $2` : ''}
      ORDER BY t.ord`
  const fieldsRes = useLiveQuery<FieldsWithTypes>(
    needsFields ? sql
      // hooks must not be conditional; run a dead query instead
    : `SELECT * FROM fields WHERE false`,
    needsFields ?
      ((table === 'places' ? [table, placeId2 ? 2 : 1] : [table]) as never[])
    : [],
  )
  const fields = fieldsRes?.rows ?? []

  // the in-place design editor replaces the form area
  if (formDesign && designing && eligible) {
    if (!designRow)
      return (
        <Jsonb
          table={table}
          idField={idField}
          id={id}
          data={data}
          orIndex={orIndex}
          autoFocus={autoFocus}
          ref={ref}
          from={from}
          fieldIds={fieldIds}
        />
      )
    return (
      <FormDesignEditor
        designRow={designRow}
        fields={fields}
        data={data}
        table={table}
        jsonFieldName={jsonFieldName}
        idField={idField}
        id={id}
      />
    )
  }

  // print view of the designed form: read-only, with a print button
  if (formPrint && designApplies) {
    const closePrint = () => {
      const { formPrint: _, ...rest } = currentSearch
      navigate({ search: rest as never })
    }
    return (
      <div className={styles.printForm}>
        <div className={`${styles.printToolbar} print-hide`}>
          <Button
            size="medium"
            icon={<MdArrowBack />}
            onClick={closePrint}
          >
            {formatMessage({ id: 'bFyZsS', defaultMessage: 'Zurück' })}
          </Button>
          <Button
            size="medium"
            icon={<PrintRegular />}
            onClick={() => window.print()}
          >
            {formatMessage({ id: 'bFzAtT', defaultMessage: 'Drucken' })}
          </Button>
        </div>
        <FormFromDesign
          design={designRow.design}
          fields={fields}
          data={data}
          mode="print"
          table={table}
          jsonFieldName={jsonFieldName}
          idField={idField}
          id={id}
        />
      </div>
    )
  }

  return (
    <>
      {eligible && (
        <FormDesignToolbar
          designRow={designRow}
          table={table}
          tableViewId={tableViewId}
          designing={designing}
        />
      )}
      {designApplies ?
        <FormFromDesign
          design={designRow.design}
          fields={fields}
          data={data}
          mode="live"
          table={table}
          jsonFieldName={jsonFieldName}
          idField={idField}
          id={id}
        />
      : <Jsonb
          table={table}
          name={jsonFieldName}
          idField={idField}
          id={id}
          orIndex={orIndex}
          data={data}
          autoFocus={autoFocus}
          ref={ref}
          from={from}
          fieldIds={fieldIds}
        />
      }
    </>
  )
}
