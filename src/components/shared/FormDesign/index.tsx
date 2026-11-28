import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { PrintRegular } from '@fluentui/react-icons'
import { MdArrowBack } from 'react-icons/md'

import { Jsonb } from '../Jsonb/index.tsx'
import { designingAtom } from '../../../store.ts'

import { FormFromDesign } from './FormFromDesign.tsx'
import { FormDesignToolbar } from './FormDesignToolbar.tsx'
import { useFormDesignBinding } from './FormDesignBindingContext.tsx'
import { useFormFields } from './useFormFields.ts'
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
 * editing mode it shows the design controls (create/edit/toggle); the
 * design editor itself is rendered by WithFormDesign, taking over the
 * whole form area. The `formPrint` search param renders the designed form
 * read-only for printing.
 *
 * The form target follows the url: the plain form of the table, or the
 * table view when the url carries a tableViewId. WithFormDesign supplies
 * the target's design row, the form's real columns and whether a design may
 * exist here and applies.
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
  const { projectId, tableViewId } = useParams({ strict: false })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false

  const currentSearch = useSearch({ strict: false }) as Record<string, unknown>
  const formPrint = currentSearch.formPrint as string | undefined

  const {
    designRow,
    designable,
    designApplies,
    columns,
    onChange,
    columnsAfter,
    columnsInList,
  } = useFormDesignBinding()

  const fields = useFormFields(table) ?? []

  // print view of the designed form: read-only, with a print button
  if (formPrint && designApplies && designRow) {
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
          columns={columns}
          onChange={onChange}
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
      {designable && (
        <FormDesignToolbar
          designRow={designRow}
          table={table}
          tableViewId={tableViewId}
          designing={designing}
        />
      )}
      {designApplies && designRow ?
        <FormFromDesign
          design={designRow.design}
          fields={fields}
          columns={columns}
          onChange={onChange}
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
          // the columns are listed among the fields — the form's fixed
          // column widgets step aside (see FormColumn)
          sortedColumns={
            columnsInList && columns ?
              { columns, onChange, columnsAfter }
            : undefined
          }
        />
      }
    </>
  )
}
