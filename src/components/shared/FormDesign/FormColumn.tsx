import { inertChangeHandler } from './FormDesignRuntimeContext.tsx'
import { useFormDesignBinding } from './FormDesignBindingContext.tsx'

/**
 * Renders a real column at the fixed position the form gives it outside the
 * design. The fixed copy steps aside when the column renders elsewhere:
 * inside the applying design (see ColumnWidget), or in the list of the
 * auto-generated form.
 */
export const FormColumn = ({ column }: { column: string }) => {
  const { columns, onChange, placedColumns, columnsInList } =
    useFormDesignBinding()
  const definition = columns?.[column]
  // not declared for this row (some columns apply to some rows only),
  // placed in the design, or listed among the jsonb fields
  if (!definition || placedColumns.has(column) || columnsInList) return null
  return definition.render({
    label: definition.label,
    onChange: onChange ?? inertChangeHandler,
  })
}
