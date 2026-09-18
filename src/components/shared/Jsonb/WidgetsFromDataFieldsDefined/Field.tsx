import { useAtom } from 'jotai'
import { useSearch } from '@tanstack/react-router'

import { FieldFormInForm } from '../../FieldFormInForm.tsx'
import { WidgetDragAndDrop } from './Widget/index.tsx'
import { Widget } from './Widget/Widget.tsx'
import { designingAtom } from '../../../../store.ts'
import type { FieldsWithTypes } from '../index.tsx'

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

// this component decides whether to show the form or the widget
export const Field = ({
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
}: Props) => {
  // from is a route id string; the literal union is too large to name here
  const { editingField } = useSearch({ from: from as never }) as {
    editingField?: string
  }
  const [designing] = useAtom(designingAtom)

  if (editingField === field.field_id) {
    return (
      <FieldFormInForm
        key={field.field_id}
        field={field}
      />
    )
  }

  const enableDragAndDrop = designing && !editingField
  const key = `${field.name}/${index}`
  const autoFocusValue = autoFocus && index === 0

  if (!enableDragAndDrop) {
    return (
      <Widget
        key={key}
        name={field.name!}
        field={field}
        data={data}
        table={table}
        jsonFieldName={jsonFieldName}
        idField={idField}
        id={id}
        orIndex={orIndex}
        autoFocus={autoFocusValue}
        ref={ref}
        from={from}
      />
    )
  }

  return (
    <WidgetDragAndDrop
      key={key}
      field={field}
      fieldsCount={fieldsCount}
      index={index}
      data={data}
      table={table}
      jsonFieldName={jsonFieldName}
      idField={idField}
      id={id}
      orIndex={orIndex}
      autoFocus={autoFocusValue}
      ref={ref}
      from={from}
    />
  )
}
