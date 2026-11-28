import {
  inertChangeHandler,
  useFormDesignRuntime,
} from './FormDesignRuntimeContext.tsx'
import styles from './FormDesign.module.css'

/**
 * Renders one real column placed in a self-designed form — the counterpart
 * of FieldWidget, which renders a jsonb key. The widget comes from the
 * form's column definition in the runtime context, so the Puck render
 * function stays stable across data changes.
 *
 * Modes:
 * - live: editable, writes the column through the form's change handler
 * - preview: looks editable but writes nothing (design editor preview)
 * - print: read-only (print view)
 */
export const ColumnWidget = ({ name }: { name: string }) => {
  const { columns, onChange, mode } = useFormDesignRuntime()
  const column = columns?.[name]
  // the column does not apply here: the form leaves out columns that do not
  // fit the row or the user (e.g. the parent place of a level-1 place)
  if (!column) return null
  const widget = column.render({
    label: column.label,
    onChange: mode === 'live' && onChange ? onChange : inertChangeHandler,
  })
  if (mode !== 'print') return widget
  return <div className={styles.printLock}>{widget}</div>
}
