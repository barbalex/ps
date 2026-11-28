import { Children, Fragment, isValidElement, type ReactNode } from 'react'
import { useLocation, useParams, useSearch } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { designingAtom } from '../../../store.ts'
import { placedColumnNames } from '../../../modules/formDesignComponents.ts'
import type { FieldChangeHandler } from '../fieldChange.ts'

import { FormDesignEditor } from './FormDesignEditor.tsx'
import { JsonbOrFormDesign } from './index.tsx'
import {
  FormDesignBindingContext,
  type FormDesignBinding,
} from './FormDesignBindingContext.tsx'
import { FormColumn } from './FormColumn.tsx'
import { useFieldSort } from './useFormDesigns.ts'
import type { FormColumns } from './FormDesignRuntimeContext.tsx'
import { useFormDesignRow } from './useFormDesignRow.ts'
import { useFormFields } from './useFormFields.ts'

const NO_COLUMNS = new Set<string>()

type FormLayout = {
  /** columns the form places after its jsonb fields; the others precede them */
  columnsAfter: string[]
  /** the form shows a field group (a table view) only */
  showsFieldGroup: boolean
}

/**
 * How the form arranges its columns around its fields, read from the children
 * it renders: columns placed after JsonbOrFormDesign follow the fields, all
 * others precede them. That fixed layout is the default order of the
 * auto-generated form, so it is declared here only — in the form's markup.
 */
const formLayout = (children: ReactNode): FormLayout => {
  const layout: FormLayout = { columnsAfter: [], showsFieldGroup: false }
  let fieldsSeen = false
  const visit = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return
      if (child.type === Fragment) {
        const fragment = child as React.ReactElement<{ children?: ReactNode }>
        visit(fragment.props.children)
      } else if (child.type === JsonbOrFormDesign) {
        const fields = child as React.ReactElement<{ fieldIds?: string[] }>
        fieldsSeen = true
        layout.showsFieldGroup = !!fields.props.fieldIds
      } else if (child.type === FormColumn && fieldsSeen) {
        const column = child as React.ReactElement<{ column: string }>
        layout.columnsAfter.push(column.props.column)
      }
    })
  }
  visit(children)
  return layout
}

/**
 * Renders the form design editor in place of the WHOLE form (header fields
 * like date and switches included) while it is open — the editor replaces
 * the form area instead of squeezing in below its fixed fields. The editor
 * opens via the `formDesign` search param, set by the design toolbar in
 * JsonbOrFormDesign; any other state renders the children unchanged.
 *
 * The form declares its real columns here (`columns`, with their write path
 * `onChange`): they become placeable in the design and are drawn at their
 * fixed positions by FormColumn. Both, plus the design that applies, are
 * handed down through FormDesignBindingContext.
 *
 * Nothing renders before the project's designs are known: the auto-generated
 * form shown first would flash before a designed one replaces it.
 */
export const WithFormDesign = ({
  table,
  idField,
  id,
  data,
  from,
  columns,
  onChange,
  children,
}: {
  table: string
  idField: string
  id?: string
  data: Record<string, unknown>
  from?: string
  /** the form's real columns, placeable in the design */
  columns?: FormColumns
  /** the form's change handler — writes the real columns */
  onChange?: FieldChangeHandler
  children: ReactNode
}) => {
  const { projectId, tableViewId } = useParams({ strict: false })
  const location = useLocation()
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const { formDesign } = useSearch({ strict: false }) as {
    formDesign?: string
  }

  const isFilter = location.pathname.endsWith('filter')
  const isHistory = from?.includes('histories') ?? false
  // designed forms exist for project tables only — not for account tables,
  // filter forms or history comparisons
  const eligible = !!projectId && !isFilter && !isHistory
  const editorOpen = !!formDesign && designing && !!id && eligible

  const { row: designRow, loaded: designsLoaded } = useFormDesignRow({
    projectId: projectId ?? undefined,
    table,
    tableViewId,
  })
  const { row: fieldSort, loaded: sortLoaded } = useFieldSort(table)
  const fields = useFormFields(table) ?? []

  const hasColumns = Object.keys(columns ?? {}).length > 0
  const { columnsAfter, showsFieldGroup } = formLayout(children)

  // a column placed in the applying design renders inside the design — its
  // fixed widget outside steps aside
  const design = designRow?.design
  const designApplies = !!designRow?.active && eligible
  // the auto-generated form lists the real columns between the jsonb fields,
  // where designers can sort them; once an order is saved the list is
  // everyone's form. (A view showing a field group keeps its fixed columns.)
  const columnsInList =
    eligible &&
    !designApplies &&
    hasColumns &&
    !showsFieldGroup &&
    (designing || !!fieldSort?.sorted_items?.length)

  if (!designsLoaded || (hasColumns && !sortLoaded)) return null

  const binding: FormDesignBinding = {
    designRow,
    designable: eligible,
    designApplies,
    columns,
    onChange,
    placedColumns: designApplies ? placedColumnNames(design) : NO_COLUMNS,
    columnsAfter,
    columnsInList,
  }

  if (editorOpen && designRow) {
    return (
      <FormDesignEditor
        designRow={designRow}
        fields={fields}
        columns={columns}
        onChange={onChange}
        data={data}
        table={table}
        idField={idField}
        id={id}
      />
    )
  }
  return (
    <FormDesignBindingContext.Provider value={binding}>
      {children}
    </FormDesignBindingContext.Provider>
  )
}
