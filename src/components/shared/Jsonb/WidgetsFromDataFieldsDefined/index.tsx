import { memo, useCallback } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../../../modules/getValueFromChange.ts'
import { Field } from './Field.tsx'

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
    return fields.map((field, index) => (
      <Field
        key={field.field_id}
        field={field}
        index={index}
        onChange={onChange}
        data={data}
        table={table}
        jsonFieldName={jsonFieldName}
        idField={idField}
        id={id}
        autoFocus={autoFocus}
        ref={ref}
      />
    ))
  },
)
