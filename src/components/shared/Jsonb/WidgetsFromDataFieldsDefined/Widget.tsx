import { memo, useCallback } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { TextField } from '../../TextField.tsx'
import { TextArea } from '../../TextArea.tsx'
import { DropdownField } from '../../DropdownField.tsx'
import { DropdownFieldFromList } from '../../DropdownFieldFromList.tsx'
import { RadioGroupFromList } from '../../RadioGroupFromList.tsx'
import { DateField } from '../../DateField.tsx'
import { TimeFields } from '../../TimeFields.tsx'
import { DateTimeField } from '../../DateTimeField.tsx'
import { EditField } from './EditField.tsx'
import { getValueFromChange } from '../../../../modules/getValueFromChange.ts'

export const Widget = memo(
  ({
    name,
    type,
    field,
    index,
    data = {},
    table,
    jsonFieldName,
    idField,
    id,
    widgetType,
    autoFocus,
    ref,
  }) => {
    const { pathname } = useLocation()
    const { place_id, place_id2 } = useParams()
    const db = usePGlite()

    const onChange = useCallback<InputProps['onChange']>(
      async (e, dataReturned) => {
        const { name, value } = getValueFromChange(e, dataReturned)
        const isDate = value instanceof Date
        const val = { ...data }
        if (value === undefined) {
          // need to remove the key from the json object
          delete val[name]
        } else {
          // in json need to save date as iso string
          val[name] = isDate ? value.toISOString() : value
        }

        const isFilter = pathname.endsWith('filter')
        const level =
          table === 'places' ? (place_id ? 2 : 1) : place_id2 ? 2 : 1

        if (isFilter) {
          // TODO: wait until new db and it's accessing lib. Then implement these queries
          // when filtering no id is passed for the row
          // how to filter on jsonb fields?
          // https://discord.com/channels/933657521581858818/1248997155448819775/1248997155448819775
          // example from electric-sql discord: https://discord.com/channels/933657521581858818/1246045111478124645
          // where: { [jsonbFieldName]: { path: ["is_admin"], equals: true } },
          const filterAtom =
            stores[`${snakeToCamel(table)}${level ? `${level}` : ''}FilterAtom`]
          const activeFilter = stores.store.get(filterAtom)
          stores.store.set(filterAtom, [
            ...activeFilter,
            { path: [jsonFieldName], contains: val },
          ])
          return
        }
        try {
          await db[table]?.update({
            where: { [idField]: id },
            data: { [jsonFieldName]: val },
          })
        } catch (error) {
          console.log(`Jsonb, error updating table '${table}':`, error)
        }
      },
      [
        data,
        pathname,
        table,
        place_id,
        place_id2,
        db,
        jsonFieldName,
        idField,
        id,
      ],
    )

    const value = data?.[name] ?? ''

    // TODO: drag and drop to order
    // only if editing
    // not if editingField

    switch (widgetType?.name) {
      case 'text':
        return (
          <TextField
            key={`${name}/${index}`}
            label={field.field_label}
            name={name}
            value={value}
            type={type ?? 'text'}
            onChange={onChange}
            autoFocus={autoFocus && index === 0}
            ref={ref}
            button={<EditField field_id={field.field_id} />}
          />
        )
      case 'textarea':
        return (
          <TextArea
            key={`${name}/${index}`}
            label={field.field_label}
            name={name}
            value={value}
            type={type ?? 'text'}
            onChange={onChange}
            autoFocus={autoFocus && index === 0}
            button={<EditField field_id={field.field_id} />}
          />
        )
      case 'dropdown':
        return (
          <DropdownField
            key={`${name}/${index}`}
            name={name}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus && index === 0}
            ref={ref}
            button={<EditField field_id={field.field_id} />}
          />
        )
      case 'options-many':
        return (
          <DropdownFieldFromList
            key={`${name}/${index}`}
            name={name}
            label={field.field_label}
            list_id={field.list_id}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus && index === 0}
            button={<EditField field_id={field.field_id} />}
          />
        )
      case 'options-few':
        return (
          <RadioGroupFromList
            key={`${name}/${index}`}
            name={name}
            label={field.field_label}
            list_id={field.list_id}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus && index === 0}
            button={<EditField field_id={field.field_id} />}
          />
        )
      case 'datepicker':
        return (
          <DateField
            key={`${name}/${index}`}
            label={field.field_label}
            name={name}
            // in json date is saved as iso string
            value={value ? new Date(value) : null}
            onChange={onChange}
            autoFocus={autoFocus && index === 0}
            button={<EditField field_id={field.field_id} />}
          />
        )
      case 'timepicker':
        return (
          <TimeFields
            key={`${name}/${index}`}
            label={field.field_label}
            name={name}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus && index === 0}
            button={<EditField field_id={field.field_id} />}
          />
        )
      case 'datetimepicker':
        return (
          <DateTimeField
            key={`${name}/${index}`}
            label={field.field_label}
            name={name}
            value={value ? new Date(value) : null}
            onChange={onChange}
            autoFocus={autoFocus && index === 0}
            button={<EditField field_id={field.field_id} />}
          />
        )
      default:
        return (
          <TextField
            key={`${name}/${index}`}
            label={field.field_label}
            name={name}
            value={value}
            type={type ?? 'text'}
            onChange={onChange}
            autoFocus={autoFocus && index === 0}
            ref={ref}
            button={<EditField field_id={field.field_id} />}
          />
        )
    }
  },
)
