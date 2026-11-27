import { useState } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useParams, useLocation } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'

import { TextField } from '../../../TextField.tsx'
import { CheckboxField } from '../../../CheckboxField.tsx'
import { NullableBooleanButtons } from '../../../NullableBooleanButtons.tsx'
import { SwitchField } from '../../../SwitchField.tsx'
import { TextArea } from '../../../TextArea.tsx'
import { MarkdownField } from '../../../MarkdownField.tsx'
import { DropdownField } from '../../../DropdownField.tsx'
import { DropdownFieldFromList } from '../../../DropdownFieldFromList.tsx'
import { MultiSelectFromList } from '../../../MultiSelectFromList.tsx'
import { RadioGroupFromList } from '../../../RadioGroupFromList.tsx'
import { DateField } from '../../../DateField.tsx'
import { TimeFields } from '../../../TimeFields.tsx'
import { DateTimeField } from '../../../DateTimeField.tsx'
import { EditField } from '../EditField.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import { updateCustomField } from '../../../../../modules/updateCustomField.ts'
import { addOperationAtom } from '../../../../../store.ts'
import { filterKeyFromTableAndLevel } from '../../../../../modules/filterKeyFromTableAndLevel.ts'
import { useUrlFilter } from '../../../../../modules/useUrlFilter.ts'
import { setNewFilterFromOld } from '../../../../../modules/setNewFilterFromOld.ts'
import type { FieldsWithTypes } from '../../index.tsx'

type Props = {
  name: string
  field: FieldsWithTypes
  data: Record<string, unknown>
  table: string
  jsonFieldName: string
  idField: string
  id: string
  orIndex?: number
  autoFocus?: boolean
  ref?: React.Ref<HTMLDivElement>
  from?: string
}

// this component focuses on creating the widgets
export const Widget = ({
  name,
  field,
  data = {},
  table,
  jsonFieldName,
  idField,
  id,
  orIndex,
  autoFocus,
  ref,
}: Props) => {
  const { placeId, placeId2 } = useParams({ strict: false })
  const location = useLocation()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const filterLevel =
    table === 'places' ?
      placeId ? 2
      : 1
    : placeId2 ? 2
    : 1
  const filterKey = filterKeyFromTableAndLevel({
    table,
    level: filterLevel,
  })
  const [filter, setFilter] = useUrlFilter(filterKey)

  const onChange = async (
    e: React.ChangeEvent<HTMLElement>,
    dataReturned?: unknown,
  ) => {
    return save(
      getValueFromChange(
        e as Parameters<typeof getValueFromChange>[0],
        dataReturned as Parameters<typeof getValueFromChange>[1],
      ),
    )
  }
  const save = async ({ name, value }: { name: string; value: unknown }) => {
    // return if value has not changed
    if (data[name] === value && field.widget_type !== 'boolean-buttons') return
    const isFilter = location.pathname.endsWith('filter')

    if (isFilter) {
      const newFilter = setNewFilterFromOld({
        name: `data.${name}`,
        value: value instanceof Date ? value.toISOString() : value,
        orFilters: filter,
        orIndex: orIndex as number,
        targetType: field.field_type as string,
        keepNull: field.widget_type === 'boolean-buttons',
      })
      setFilter(newFilter)
      return
    }

    try {
      await addOperation(
        await updateCustomField(db, {
          table,
          idField,
          id,
          jsonFieldName,
          name,
          value,
        }),
      )
    } catch (error) {
      console.log(`Jsonb, error updating table '${table}':`, error)
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: (error as Error).message },
      }))
      return
    }
    setValidations((prev) => {
      const { [name]: _, ...rest } = prev
      return rest
    })
    return
  }

  const value = data?.[name] ?? ''
  const label = field.field_label ? field.field_label : field.name
  const type = field.field_type === 'integer' ? 'number' : 'text'

  const filterMarkdown =
    (field.widget_type === 'markdown' || field.widget_type === 'rich-text') &&
    location.pathname.endsWith('filter')
  switch (filterMarkdown ? 'text' : field.widget_type) {
    case 'text':
      return (
        <TextField
          label={label}
          name={name}
          value={value as string | number}
          type={type}
          inputMode={field.field_type === 'decimal' ? 'decimal' : undefined}
          numericSettings={
            (
              !location.pathname.endsWith('filter') &&
              ['integer', 'decimal'].includes(field.field_type ?? '')
            ) ?
              field
            : undefined
          }
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'jes-no':
      return (
        <SwitchField
          label={label}
          name={name}
          value={value as boolean | null}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'checkbox-2':
      return (
        <CheckboxField
          label={label ?? undefined}
          name={name}
          value={value as boolean | null}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'checkbox-3':
      return (
        <CheckboxField
          label={label ?? undefined}
          name={name}
          value={value as boolean | null}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          indeterminate={true}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'boolean-buttons':
      return (
        <NullableBooleanButtons
          label={label ?? name}
          value={data[name]}
          filter={location.pathname.endsWith('filter')}
          autoFocus={autoFocus}
          button={<EditField fieldId={field.field_id} />}
          validationMessage={validations[name]?.message}
          onChange={(value) => save({ name, value })}
        />
      )
    case 'markdown':
    case 'rich-text':
      return (
        <MarkdownField
          key={`${id}:${name}:${field.widget_type}`}
          rich={field.widget_type === 'rich-text'}
          name={name}
          label={label}
          value={value as string}
          onSave={(value) => save({ name, value })}
          autoFocus={autoFocus}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'textarea':
      return (
        <TextArea
          label={label}
          name={name}
          value={value as string}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLTextAreaElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'dropdown':
      return (
        <DropdownField
          name={name}
          table={undefined as unknown as string}
          value={value as string}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'multiselect-few':
    case 'multiselect-many': {
      const isFilter = location.pathname.endsWith('filter')
      return (
        <MultiSelectFromList
          key={`${id}:${name}:${orIndex ?? ''}`}
          label={label ?? name}
          listId={field.list_id}
          fieldType={field.field_type}
          searchable={field.widget_type === 'multiselect-many'}
          value={value}
          filter={isFilter}
          validationMessage={validations[name]?.message}
          autoFocus={autoFocus}
          button={<EditField fieldId={field.field_id} />}
          onChange={(codes, mode) => {
            if (!isFilter) return save({ name, value: codes })
            return setFilter(
              setNewFilterFromOld({
                name: `${jsonFieldName}.${name}`,
                value: codes.length ? { [mode]: codes } : null,
                orFilters: filter,
                orIndex: orIndex!,
                targetType: 'text',
              }),
            )
          }}
        />
      )
    }
    case 'options-many':
      return (
        <DropdownFieldFromList
          key={`${id}:${name}:${orIndex ?? ''}`}
          name={name}
          label={label as string | undefined}
          list_id={field.list_id as string}
          value={value}
          onChange={(value) => save({ name, value })}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'options-few':
      return (
        <RadioGroupFromList
          name={name}
          label={label ?? undefined}
          list_id={field.list_id as string}
          value={value as string}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'datepicker':
      return (
        <DateField
          label={label ?? undefined}
          name={name}
          // in json date is saved as iso string
          value={value ? new Date(value as string) : null}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'timepicker':
      return (
        <TimeFields
          label={label as string | undefined}
          name={name}
          value={value as string}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    case 'datetimepicker':
      return (
        <DateTimeField
          label={label ?? undefined}
          name={name}
          value={value ? new Date(value as string) : null}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
    default:
      return (
        <TextField
          label={label}
          name={name}
          value={value as string | number}
          type={type}
          onChange={onChange}
          autoFocus={autoFocus}
          ref={ref as unknown as React.Ref<HTMLInputElement>}
          button={<EditField fieldId={field.field_id} />}
          validationState={validations[name]?.state}
          validationMessage={validations[name]?.message}
        />
      )
  }
}
