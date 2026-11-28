// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { usePGlite } from '@electric-sql/pglite-react'
import { useFormFields } from '../FormDesign/useFormFields.ts'
import { followupVisible } from '../../../modules/followupVisible.ts'
import { useLocation, useParams } from '@tanstack/react-router'
import { useAtom, useSetAtom } from 'jotai'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { TextField } from '../TextField.tsx'
import { accountTables } from '../../../formsAndLists/field/accountTables.ts'
import { AddField } from './AddField.tsx'
import { WidgetsFromDataFieldsDefined } from './WidgetsFromDataFieldsDefined/index.tsx'
import type { FormItem } from './WidgetsFromDataFieldsDefined/index.tsx'
import { useFieldSort } from '../FormDesign/useFormDesigns.ts'
import type { FormColumns } from '../FormDesign/FormDesignRuntimeContext.tsx'
import type { FieldChangeHandler } from '../fieldChange.ts'
import { formItemOrder } from '../../../modules/formItemOrder.ts'
import {
  fieldComponentType,
  isFieldComponentType,
  nameOfComponentType,
} from '../../../modules/formDesignComponents.ts'
import { filterKeyFromTableAndLevel } from '../../../modules/filterKeyFromTableAndLevel.ts'
import { placeScopedFieldTables } from '../../../modules/fieldTableLabel.ts'
import { useUrlFilter } from '../../../modules/useUrlFilter.ts'
import { setNewFilterFromOld } from '../../../modules/setNewFilterFromOld.ts'
import { addOperationAtom, designingAtom } from '../../../store.ts'

import type Fields from '../../../models/public/Fields.ts'
import type FieldTypes from '../../../models/public/FieldTypes.ts'
import type WidgetTypes from '../../../models/public/WidgetTypes.ts'

export type FieldsWithTypes = Fields & {
  field_type: FieldTypes['name']
  widget_type: WidgetTypes['name']
}

interface Props {
  table: string
  name?: string // json field name, defaults to 'data'
  idField: string
  id: string
  orIndex?: number // only for array of jsonb objects
  data: Record<string, unknown>
  autoFocus?: boolean
  ref?: React.Ref<HTMLDivElement>
  from?: string
  /** restrict rendering to these field_ids (field group of a table view) */
  fieldIds?: string[]
  /**
   * The form's real columns, listed between the jsonb fields in an order
   * designers can sort: the plain form of a table that has columns. Without
   * it the list holds the jsonb fields alone.
   */
  sortedColumns?: {
    columns: FormColumns
    /** the form's change handler — writes the columns */
    onChange?: FieldChangeHandler
    /** the columns the form places after its fields; the others precede them */
    columnsAfter: string[]
  }
}

// and focus the name field on first render?
export const Jsonb = ({
  table,
  name: jsonFieldName = 'data',
  idField,
  id,
  orIndex,
  data = {},
  autoFocus = false,
  ref,
  from,
  fieldIds,
  sortedColumns,
}: Props) => {
  const isAccountTable = accountTables.includes(table)
  const { projectId, placeId, placeId2 } = useParams({ strict: false })
  const location = useLocation()
  const db = usePGlite()
  const filterLevel =
    table === 'places' ?
      placeId ? 2
      : 1
    : placeId2 ? 2
    : 1
  const [filter, setFilter] = useUrlFilter(
    filterKeyFromTableAndLevel({ table, level: filterLevel }),
  )

  const addOperation = useSetAtom(addOperationAtom)

  const allFields = useFormFields(table)
  const { row: fieldSort } = useFieldSort(table)

  // fields of groups used by a view of this table are reserved: they only
  // render in those views, not in the plain form. Designers still see all.
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  if (!allFields) return null

  // a table view with a field group shows only the group's fields
  let fields: FieldsWithTypes[]
  if (fieldIds) {
    fields = allFields.filter((field) => fieldIds.includes(field.field_id))
  } else if (designing) {
    fields = allFields
  } else {
    fields = allFields.filter((field) => !field.reserved)
  }

  // TODO: return if value has not changed
  const onChange = async (
    e: Parameters<typeof getValueFromChange>[0],
    dataReturned: Parameters<typeof getValueFromChange>[1],
    _removed?: boolean,
  ) => {
    const { name, value } = getValueFromChange(e, dataReturned)
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
      const newFilter = setNewFilterFromOld({
        name: `${jsonFieldName}.${name}`,
        value: val[name],
        orFilters: filter,
        orIndex: orIndex as number,
        targetType: 'text',
      })
      setFilter(newFilter)
      return
    }
    const prevRes = await db.query(
      `SELECT * FROM ${table} WHERE ${idField} = $1`,
      [id],
    )
    const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
    try {
      await db.query(
        `UPDATE ${table} SET ${jsonFieldName} = $1 WHERE ${idField} = $2`,
        [val, id],
      )
    } catch (error) {
      console.log(`Jsonb, error updating table '${table}':`, error)
    }
    addOperation({
      table,
      rowIdName: idField,
      rowId: id,
      operation: 'update',
      draft: { [jsonFieldName]: val },
      prev,
    })
  }

  // What if data contains keys not existing in fields? > show but warn
  // (not for restricted views: fields outside the group are expected there)
  const fieldNamesDefined = allFields.map((field) => field.name)
  const dataKeys = Object.keys(data)
  const dataKeysNotDefined =
    fieldIds ?
      []
    : dataKeys.filter((dataKey) => !fieldNamesDefined.includes(dataKey))
  const isHistory = from?.includes('histories')
  if (!designing && !isHistory && !location.pathname.endsWith('filter')) {
    fields = fields.filter((field) => followupVisible(field, allFields, data))
  }

  // the list of the form: its jsonb fields — plus, for a table with real
  // columns, those columns sorted among them. The order is the saved one,
  // else the form's fixed layout (columns before the fields, fields, columns
  // after them)
  const columnNames = Object.keys(sortedColumns?.columns ?? {})
  const itemOrder =
    sortedColumns ?
      formItemOrder({
        saved: fieldSort?.sorted_items,
        columnsBefore: columnNames.filter(
          (name) => !sortedColumns.columnsAfter.includes(name),
        ),
        columnsAfter: sortedColumns.columnsAfter.filter((name) =>
          columnNames.includes(name),
        ),
        fields: allFields.map((field) => field.field_id),
      })
    : undefined
  const displayedFieldIds = new Set(fields.map((field) => field.field_id))
  const itemOfToken = (token: string): FormItem | undefined => {
    if (isFieldComponentType(token)) {
      const field = allFields.find(
        (candidate) => fieldComponentType(candidate.field_id) === token,
      )
      // hidden fields (reserved, or a follow-up not asked right now) are not listed
      return field && displayedFieldIds.has(field.field_id) ?
          { type: 'field', field }
        : undefined
    }
    const name = nameOfComponentType(token)
    return name && sortedColumns?.columns[name] ?
        { type: 'column', name }
      : undefined
  }
  const items: FormItem[] =
    itemOrder ?
      itemOrder.flatMap((token) => itemOfToken(token) ?? [])
    : fields.map((field) => ({ type: 'field' as const, field }))

  return (
    <>
      {items.length > 0 ?
        <WidgetsFromDataFieldsDefined
          key="widgetsFromDataFieldsDefined"
          items={items}
          itemOrder={itemOrder}
          columns={sortedColumns?.columns}
          onColumnChange={sortedColumns?.onChange}
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
            (data?.[dataKey] as Date | undefined)?.toLocaleDateString?.() ??
            (data?.[dataKey] as string | number | undefined) ??
            ''
          }
          onChange={(e, dataReturned) => {
            // if value was removed, remove the key also
            onChange(e, dataReturned!, true)
          }}
          // if isHistory, don't warn about undefined fields
          validationState={isHistory ? undefined : 'warning'}
          validationMessage={
            isHistory ? undefined : (
              `This field is not defined for this ${
                isAccountTable ? 'account' : 'project'
              }`
            )
          }
          autoFocus={autoFocus && index === 0 && fields.length === 0}
        />
      ))}
      {!isHistory && !fieldIds && (
        <AddField
          key="addField"
          tableName={table}
          level={
            placeScopedFieldTables.has(table) ?
              placeId2 ?
                2
              : 1
            : undefined
          }
          from={from}
        />
      )}
    </>
  )
}
