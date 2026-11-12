import { useState } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../TextField.tsx'
import { CheckboxField } from '../CheckboxField.tsx'
import { SwitchField } from '../SwitchField.tsx'
import { TextArea } from '../TextArea.tsx'
import { DropdownField } from '../DropdownField.tsx'
import { DropdownFieldFromList } from '../DropdownFieldFromList.tsx'
import { RadioGroupFromList } from '../RadioGroupFromList.tsx'
import { DateField } from '../DateField.tsx'
import { TimeFields } from '../TimeFields.tsx'
import { DateTimeField } from '../DateTimeField.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
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
  const type = field.field_type === 'integer' ? 'number' : field.field_type

  const onChange = async (
    e: React.ChangeEvent<HTMLElement>,
    dataReturned?: unknown,
  ) => {
    if (mode !== 'live') return
    const { name, value } = getValueFromChange(
      e as Parameters<typeof getValueFromChange>[0],
      dataReturned as Parameters<typeof getValueFromChange>[1],
    )
    // return if value has not changed
    if (data[name] === value) return
    // date widgets return a Date object even though it is not in the union
    const valueAsObject = value as unknown as Date | null | undefined
    const isDate = valueAsObject instanceof Date
    const val = { ...data }
    if (value === undefined) {
      // need to remove the key from the json object
      delete val[name]
    } else {
      // in json need to save date as iso string
      val[name] = isDate ? valueAsObject.toISOString() : value
    }

    const prevRes = await db.query(
      `select * from ${table} where ${idField} = $1`,
      [id],
    )
    const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
    try {
      await db.query(
        `update ${table} set ${jsonFieldName} = $1 where ${idField} = $2`,
        [val, id],
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
    addOperation({
      table,
      rowIdName: idField,
      rowId: id,
      operation: 'update',
      draft: { [jsonFieldName]: val },
      prev,
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
            type={(type ?? 'text') as 'text' | 'number'}
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
      case 'options-many':
        return (
          <DropdownFieldFromList
            name={name}
            label={label as string | undefined}
            list_id={field.list_id as string}
            value={value as string}
            onChange={onChange}
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
            type={(type ?? 'text') as 'text' | 'number'}
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
