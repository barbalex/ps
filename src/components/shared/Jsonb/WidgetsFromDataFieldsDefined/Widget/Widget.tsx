import { useState } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useParams, useLocation } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'

import { TextField } from '../../../TextField.tsx'
import { CheckboxField } from '../../../CheckboxField.tsx'
import { SwitchField } from '../../../SwitchField.tsx'
import { TextArea } from '../../../TextArea.tsx'
import { DropdownField } from '../../../DropdownField.tsx'
import { DropdownFieldFromList } from '../../../DropdownFieldFromList.tsx'
import { RadioGroupFromList } from '../../../RadioGroupFromList.tsx'
import { DateField } from '../../../DateField.tsx'
import { TimeFields } from '../../../TimeFields.tsx'
import { DateTimeField } from '../../../DateTimeField.tsx'
import { EditField } from '../EditField.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import * as stores from '../../../../../store.ts'
import { addOperationAtom, store } from '../../../../../store.ts'
import { filterAtomNameFromTableAndLevel } from '../../../../../modules/filterAtomNameFromTableAndLevel.ts'
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

  const filterLevel = table === 'places' ? (placeId ? 2 : 1) : placeId2 ? 2 : 1
  const filterAtomName = filterAtomNameFromTableAndLevel({
    table,
    level: filterLevel,
  })
  // lookup atoms by name; every entry is a filter atom like projectsFilterAtom
  const filterAtoms = stores as unknown as Record<
    string,
    typeof stores.projectsFilterAtom
  >
  const filterAtom = filterAtoms[filterAtomName] ?? stores.projectsFilterAtom
  const setFilter = useSetAtom(filterAtom)

  const onChange = async (
    e: React.ChangeEvent<HTMLElement>,
    dataReturned?: unknown,
  ) => {
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

    const isFilter = location.pathname.endsWith('filter')

    if (isFilter) {
      const orFilters = store.get(filterAtom)
      const newFilter = setNewFilterFromOld({
        name: `data.${name}`,
        value: val[name],
        orFilters,
        orIndex: orIndex as number,
        targetType: field.field_type as string,
      })
      setFilter(newFilter)
      return
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
    addOperation({
      table,
      rowIdName: idField,
      rowId: id,
      operation: 'update',
      draft: { [jsonFieldName]: val },
      prev,
    })

    return
  }

  const value = data?.[name] ?? ''
  const label = field.field_label ? field.field_label : field.name
  const type = field.field_type === 'integer' ? 'number' : field.field_type

  // TODO: add: markdown, rich-text, jes-no (rename existing to switch)
  switch (field.widget_type) {
    case 'text':
      return (
        <TextField
          label={label}
          name={name}
          value={value as string | number}
          type={(type ?? 'text') as 'text' | 'number'}
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
    case 'options-many':
      return (
        <DropdownFieldFromList
          name={name}
          label={label as string | undefined}
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
          type={(type ?? 'text') as 'text' | 'number'}
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
