import { SortableItem } from '../SortableItem.tsx'
import { Widget } from './Widget.tsx'

import { fieldComponentType } from '../../../../../modules/formDesignComponents.ts'
import type { FieldsWithTypes } from '../../index.tsx'

type Props = {
  field: FieldsWithTypes
  fieldsCount: number
  index: number
  data: Record<string, unknown>
  table: string
  jsonFieldName: string
  id: string
  orIndex?: number
  idField: string
  autoFocus?: boolean
  ref?: React.Ref<HTMLDivElement>
  from?: string
}

// the widget of a jsonb field as an item of the form's sortable list
export const WidgetDragAndDrop = ({
  field,
  fieldsCount,
  index,
  data,
  table,
  jsonFieldName,
  id,
  orIndex,
  idField,
  autoFocus,
  ref,
  from,
}: Props) => (
  <SortableItem
    itemId={fieldComponentType(field.field_id)}
    label={field.field_label || field.name || ''}
    index={index}
    count={fieldsCount}
  >
    <Widget
      name={field.name!}
      field={field}
      data={data}
      table={table}
      jsonFieldName={jsonFieldName}
      idField={idField}
      id={id}
      orIndex={orIndex}
      autoFocus={autoFocus}
      ref={ref}
      from={from}
    />
  </SortableItem>
)
