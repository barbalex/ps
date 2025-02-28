// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { memo, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { TextField } from '../TextField.tsx'
import { accountTables } from '../../../routes/field/accountTables.ts'
import { AddField } from './AddField.tsx'
import { WidgetsFromDataFieldsDefined } from './WidgetsFromDataFieldsDefined/index.tsx'
import { snakeToCamel } from '../../../modules/snakeToCamel.ts'
import * as stores from '../../../store.ts'

// and focus the name field on first render?
export const Jsonb = memo(
  ({
    table,
    name: jsonFieldName = 'data',
    idField,
    id,
    data = {},
    autoFocus = false,
    ref,
  }) => {
    const isAccountTable = accountTables.includes(table)
    const { project_id, place_id, place_id2 } = useParams()
    const { pathname } = useLocation()
    const db = usePGlite()

    const useProjectId = project_id && table !== 'projects'
    const sql = isAccountTable
      ? `SELECT * FROM fields WHERE table_name = $1 and project_id ${
          useProjectId ? `= '${project_id}'` : 'IS NULL'
        } order by sort_index asc, label asc`
      : `SELECT * FROM fields WHERE table_name = $1 and project_id ${
          useProjectId ? `= '${project_id}'` : 'IS NULL'
        } and level = $2 order by sort_index asc, label asc`
    const params = isAccountTable ? [table] : [table, place_id2 ? 2 : 1]
    const result = useLiveIncrementalQuery(sql, params, 'field_id')
    const fields = result?.rows ?? []

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
        // TODO: test
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

    // What if data contains keys not existing in fields? > show but warn
    const fieldNamesDefined = fields.map((field) => field.name)
    const dataKeys = Object.keys(data)
    const dataKeysNotDefined = dataKeys.filter(
      (dataKey) => !fieldNamesDefined.includes(dataKey),
    )

    return (
      <>
        {fields.length > 0 ? (
          <WidgetsFromDataFieldsDefined
            key="widgetsFromDataFieldsDefined"
            fields={fields}
            data={data}
            table={table}
            jsonFieldName={jsonFieldName}
            idField={idField}
            id={id}
            autoFocus={autoFocus}
            ref={ref}
          />
        ) : null}
        {dataKeysNotDefined.map((dataKey, index) => (
          <TextField
            key={dataKey}
            label={dataKey}
            name={dataKey}
            value={
              data?.[dataKey]?.toLocaleDateString?.() ?? data?.[dataKey] ?? ''
            }
            onChange={(e, dataReturned) => {
              // if value was removed, remove the key also
              onChange(e, dataReturned, true)
            }}
            validationState="warning"
            validationMessage={`This field is not defined for this ${
              isAccountTable ? 'account' : 'project'
            }`}
            autoFocus={autoFocus && index === 0 && fields.length === 0}
          />
        ))}
        <AddField
          key="addField"
          tableName={table}
          level={place_id2 ? 2 : 1}
        />
      </>
    )
  },
)
