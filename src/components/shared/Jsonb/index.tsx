// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { memo, useCallback } from 'react'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useLocation, useParams } from '@tanstack/react-router'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { TextField } from '../TextField.tsx'
import { accountTables } from '../../../formsAndLists/field/accountTables.ts'
import { AddField } from './AddField.tsx'
import { WidgetsFromDataFieldsDefined } from './WidgetsFromDataFieldsDefined/index.tsx'
import { filterAtomNameFromTableAndLevel } from '../../../modules/filterAtomNameFromTableAndLevel.ts'
import * as stores from '../../../store.ts'

// and focus the name field on first render?
export const Jsonb = memo(
  ({
    table,
    name: jsonFieldName = 'data',
    idField,
    id,
    orIndex,
    data = {},
    autoFocus = false,
    ref,
    from,
  }) => {
    const isAccountTable = accountTables.includes(table)
    const { projectId, placeId, placeId2 } = useParams({ from })
    const location = useLocation()
    const db = usePGlite()

    const useProjectId = projectId && table !== 'projects'
    const sql = `
      SELECT 
        fields.*,
        field_types.name as field_type,
        widget_types.name as widget_type
      FROM fields 
        INNER JOIN field_types USING (field_type_id)
        INNER JOIN widget_types USING (widget_type_id)
        LEFT JOIN unnest(
            ARRAY(SELECT sorted_field_ids FROM field_sorts WHERE table_name = fields.table_name and project_id = fields.project_id)
          ) WITH ORDINALITY t(field_id, ord) USING (field_id)
      WHERE 
        fields.table_name = $1 
        and fields.project_id ${useProjectId ? `= '${projectId}'` : 'IS NULL'}
        ${!isAccountTable ? ` and level = $2` : ''} 
      ORDER BY t.ord`
    const params = isAccountTable ? [table] : [table, placeId2 ? 2 : 1]
    const res = useLiveIncrementalQuery(sql, params, 'field_id')
    const fields = res?.rows ?? []

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

        const isFilter = location.pathname.endsWith('filter')
        const level =
          table === 'places' ?
            placeId ? 2
            : 1
          : placeId2 ? 2
          : 1

        if (isFilter) {
          // TODO: wait until new db and it's accessing lib. Then implement these queries
          // when filtering no id is passed for the row
          // how to filter on jsonb fields?
          // https://discord.com/channels/933657521581858818/1248997155448819775/1248997155448819775
          // example from electric-sql discord: https://discord.com/channels/933657521581858818/1246045111478124645
          // where: { [jsonbFieldName]: { path: ["is_admin"], equals: true } },
          const filterAtom = filterAtomNameFromTableAndLevel({
            table,
            level,
          })
          const activeFilter = stores.store.get(filterAtom)
          const newFilter = `${
            activeFilter.length ? `${activeFilter} AND ` : ''
          }${jsonFieldName}->>'${name}' = '${val[name]}'`
          stores.store.set(filterAtom, newFilter)
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
        location.pathname,
        table,
        placeId,
        placeId2,
        jsonFieldName,
        idField,
        db,
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
        {fields.length > 0 ?
          <WidgetsFromDataFieldsDefined
            key="widgetsFromDataFieldsDefined"
            fields={fields}
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
        : null}
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
          level={placeId2 ? 2 : 1}
          from={from}
        />
      </>
    )
  },
)
