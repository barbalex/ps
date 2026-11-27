import { useState } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../TextField.tsx'
import { CheckboxField } from '../CheckboxField.tsx'
import { SwitchField } from '../SwitchField.tsx'
import { TextArea } from '../TextArea.tsx'
import { MarkdownField } from '../MarkdownField.tsx'
import { DropdownField } from '../DropdownField.tsx'
import { DropdownFieldFromList } from '../DropdownFieldFromList.tsx'
import { MultiSelectFromList } from '../MultiSelectFromList.tsx'
import { RadioGroupFromList } from '../RadioGroupFromList.tsx'
import { DateField } from '../DateField.tsx'
import { TimeFields } from '../TimeFields.tsx'
import { DateTimeField } from '../DateTimeField.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { updateCustomField } from '../../../modules/updateCustomField.ts'
import { addOperationAtom } from '../../../store.ts'
import type { FieldsWithTypes } from '../Jsonb/index.tsx'

import styles from './FormDesign.module.css'
import { useFormDesignRuntime } from './FormDesignRuntimeContext.tsx'

/**
 * Renders one field of a self-designed form — the counterpart of the
 * auto-generated form's Widget. The binding (row data, write path, mode)
 * comes from FormDesignRuntimeContext so the Puck render functions stay
 * stable across data changes.
 *
 * Modes:
 * - live: editable, writes the row's jsonb like Widget does
 * - preview: looks editable but writes nothing (design editor preview)
 * - print: read-only (print view)
 */
export const FieldWidget = ({ field }: { field: FieldsWithTypes }) => {
  const {
    data = {},
    mode,
    table,
    jsonFieldName,
    idField,
    id,
  } = useFormDesignRuntime()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const name = field.name!
  const value = data?.[name] ?? ''
  const label = field.field_label ? field.field_label : field.name
  const type = field.field_type === 'integer' ? 'number' : 'text'

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
    if (mode !== 'live') return
    // return if value has not changed
    if (data[name] === value) return
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
      console.log(`FormDesign, error updating table '${table}':`, error)
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
  }

  const validationProps = {
    validationState: validations[name]?.state,
    validationMessage: validations[name]?.message,
  }

  // print renders the widgets inert (paper is not interactive); preview
  // keeps them interactive — nothing is written in preview mode
  const widget = (() => {
    switch (field.widget_type) {
      case 'text':
        return (
          <TextField
            label={label}
            name={name}
            value={value as string | number}
            type={type}
            inputMode={field.field_type === 'decimal' ? 'decimal' : undefined}
            numericSettings={
              ['integer', 'decimal'].includes(field.field_type ?? '') ? field
              : undefined
            }
            onChange={onChange}
            {...validationProps}
          />
        )
      case 'jes-no':
        return (
          <SwitchField
            label={label}
            name={name}
            value={value as boolean | null}
            onChange={onChange}
            {...validationProps}
          />
        )
      case 'checkbox-2':
        return (
          <CheckboxField
            label={label ?? undefined}
            name={name}
            value={value as boolean | null}
            onChange={onChange}
            {...validationProps}
          />
        )
      case 'checkbox-3':
        return (
          <CheckboxField
            label={label ?? undefined}
            name={name}
            value={value as boolean | null}
            onChange={onChange}
            indeterminate={true}
            {...validationProps}
          />
        )
      case 'markdown':
      case 'rich-text':
        return (
          <MarkdownField
            key={`${id}:${name}:${field.widget_type}:${mode}`}
            rich={field.widget_type === 'rich-text'}
            name={name}
            label={label}
            value={value as string}
            print={mode === 'print'}
            onSave={(value) => save({ name, value })}
            {...validationProps}
          />
        )
      case 'textarea':
        return (
          <TextArea
            label={label}
            name={name}
            value={value as string}
            onChange={onChange}
            {...validationProps}
          />
        )
      case 'dropdown':
        return (
          <DropdownField
            name={name}
            table={undefined as unknown as string}
            value={value as string}
            onChange={onChange}
            {...validationProps}
          />
        )
      case 'multiselect-few':
      case 'multiselect-many':
        return (
          <MultiSelectFromList
            key={`${id}:${name}`}
            label={label ?? name}
            listId={field.list_id}
            fieldType={field.field_type}
            searchable={field.widget_type === 'multiselect-many'}
            value={value}
            preview={mode === 'preview'}
            print={mode === 'print'}
            validationMessage={validations[name]?.message}
            onChange={(codes) => save({ name, value: codes })}
          />
        )
      case 'options-many':
        return (
          <DropdownFieldFromList
            key={`${id}:${name}:${mode}`}
            name={name}
            label={label as string | undefined}
            list_id={field.list_id as string}
            value={value}
            preview={mode === 'preview'}
            print={mode === 'print'}
            onChange={(value) => save({ name, value })}
            {...validationProps}
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
            {...validationProps}
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
            {...validationProps}
          />
        )
      case 'timepicker':
        return (
          <TimeFields
            label={label as string | undefined}
            name={name}
            value={value as string}
            onChange={onChange}
            {...validationProps}
          />
        )
      case 'datetimepicker':
        return (
          <DateTimeField
            label={label ?? undefined}
            name={name}
            value={value ? new Date(value as string) : null}
            onChange={onChange}
            {...validationProps}
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
            {...validationProps}
          />
        )
    }
  })()

  if (mode === 'print') {
    return <div className={styles.printLock}>{widget}</div>
  }
  return widget
}
