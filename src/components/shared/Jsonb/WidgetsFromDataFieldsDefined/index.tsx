import { memo, useCallback } from 'react'
import { useSearchParams, useLocation, useParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { FieldFormInForm } from '../../FieldFormInForm.tsx'
import { TextField } from '../../TextField.tsx'
import { EditField } from './EditField.tsx'
import { getValueFromChange } from '../../../../modules/getValueFromChange.ts'
import { Widget } from './Widget.tsx'

// TODO: Uncaught (in promise) error: invalid input syntax for type uuid: ""
export const WidgetsFromDataFieldsDefined = memo(
  ({
    fields,
    data = {},
    table,
    jsonFieldName,
    idField,
    id,
    autoFocus,
    ref,
  }) => {
    console.log('WidgetsFromDataFieldsDefined', { fields, data, table })
    const [searchParams] = useSearchParams()
    const { pathname } = useLocation()
    const { place_id, place_id2 } = useParams()
    const editingField = searchParams.get('editingField')
    const db = usePGlite()

    const fieldTypeIds = fields.map((field) => field.field_type_id)
    console.log('WidgetsFromDataFieldsDefined', { fieldTypeIds })

    // TODO: test
    const resultFieldTypes = useLiveQuery(
      `SELECT * FROM field_types where field_type_id in ($1)`,
      [fields.map((field) => field.field_type_id)],
    )
    const fieldTypes = resultFieldTypes?.rows ?? []
    console.log('WidgetsFromDataFieldsDefined', { fieldTypes })

    const resultWidgetTypes = useLiveQuery(
      `SELECT * FROM widget_types where widget_type_id in ($1)`,
      [fields.map((field) => field.widget_type_id)],
    )
    const widgetTypes = resultWidgetTypes?.rows ?? []
    console.log('WidgetsFromDataFieldsDefined', { widgetTypes })

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
        const sql = `UPDATE ${table} SET ${jsonFieldName} = $1 WHERE ${idField} = $2`
        try {
          await db.query(sql, [val, id])
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

    // TODO: drag and drop to order
    // only if editing
    // not if editingField
    return fields.map((field, index) => {
      if (editingField === field.field_id) {
        return <FieldFormInForm key={field.field_id} field={field} />
      }
      const { name, field_label } = field
      const widgetType = widgetTypes.find(
        (widgetType) => widgetType.widget_type_id === field.widget_type_id,
      )
      const fieldType = fieldTypes.find(
        (fieldType) => fieldType.field_type_id === field.field_type_id,
      )
      const type = fieldType?.name === 'integer' ? 'number' : fieldType?.name

      if (!widgetType?.name && !widgetType?.text) {
        return null
      }
      const value = data?.[name] ?? ''
      if (!widgetType?.name) {
        return (
          <TextField
            key={`${name}/${index}`}
            label={field_label}
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

      return (
        <Widget
          key={`${name}/${index}`}
          name={name}
          type={type}
          field={field}
          index={index}
          data={data}
          table={table}
          jsonFieldName={jsonFieldName}
          idField={idField}
          id={id}
          widgetType={widgetType}
          autoFocus={autoFocus && index === 0}
          ref={ref}
        />
      )
    })
  },
)
