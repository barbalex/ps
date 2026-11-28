import { useAtom } from 'jotai'
import { useParams, useSearch } from '@tanstack/react-router'

import { designingAtom } from '../../../../store.ts'
import type { FieldChangeHandler } from '../../fieldChange.ts'
import {
  inertChangeHandler,
  type FormColumns,
} from '../../FormDesign/FormDesignRuntimeContext.tsx'
import { columnComponentType } from '../../../../modules/formDesignComponents.ts'

import { SortableItem } from './SortableItem.tsx'

/**
 * A real column of the form's table as an item of the form's sortable list —
 * the counterpart of Field, which renders a jsonb field. The widget comes
 * from the form's column definition and writes through the form's change
 * handler.
 */
export const ColumnItem = ({
  name,
  index,
  count,
  columns,
  onChange,
}: {
  name: string
  index: number
  /** the number of items in the list */
  count: number
  columns?: FormColumns
  onChange?: FieldChangeHandler
}) => {
  // sorting is enabled while designing and no field is being edited — the
  // same rule as for fields (see Field)
  const { editingField } = useSearch({ strict: false }) as {
    editingField?: string
  }
  const { projectId } = useParams({ strict: false })
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false

  const column = columns?.[name]
  if (!column) return null
  const widget = column.render({
    label: column.label,
    onChange: onChange ?? inertChangeHandler,
  })
  if (!designing || editingField) return widget
  return (
    <SortableItem
      itemId={columnComponentType(name)}
      label={column.label}
      index={index}
      count={count}
    >
      {widget}
    </SortableItem>
  )
}
