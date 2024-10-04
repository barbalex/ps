// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { memo, useCallback, forwardRef } from 'react'
import { useParams, useSearchParams, useLocation } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { TextField } from '../TextField.tsx'
// import { TimeFieldMasked } from './TimeFieldMasked'
import { TextArea } from '../TextArea.tsx'
import { DropdownField } from '../DropdownField.tsx'
import { DropdownFieldFromList } from '../DropdownFieldFromList.tsx'
import { RadioGroupFromList } from '../RadioGroupFromList.tsx'
import { DateField } from '../DateField.tsx'
// import { TimeField } from './TimeField'
import { TimeFields } from '../TimeFields.tsx'
import { DateTimeField } from '../DateTimeField.tsx'
import { accountTables } from '../../../routes/field/accountTables.ts'
import { FieldFormInForm } from '../FieldFormInForm.tsx'
import { EditField } from './EditField.tsx'
import { AddField } from './AddField.tsx'
import { snakeToCamel } from '../../../modules/snakeToCamel.ts'
import * as stores from '../../../store.ts'

// all tables that have configurable fields
// import {
//   Projects as Project,
//   Subprojects as Subproject,
//   Taxonomies as Taxonomy,
//   Taxa as Taxon,
//   Lists as List,
//   Places as Place,
//   Actions as Action,
//   Action_reports as ActionReport,
//   Checks as Check,
//   Place_reports as PlaceReport,
//   Goals as Goal,
//   Goal_reports as GoalReport,
//   Subproject_reports as SubprojectReport,
//   Project_reports as ProjectReport,
//   Files as File,
//   Persons as Person,
//   Occurrences as Occurrence,
// } from '../../../generated/client/index.ts'

type Props = {
  table: string
  name?: string
  idField: string
  id: string
  data: Record<string, unknown>
  autoFocus?: boolean
}

// TODO: if editing a field, show the field form
// and focus the name field on first render?
export const Jsonb = memo(
  forwardRef(
    (
      {
        table,
        name: jsonFieldName = 'data',
        idField,
        id,
        data = {},
        autoFocus = false,
      }: Props,
      ref,
    ) => {
      const isAccountTable = accountTables.includes(table)
      const { project_id, place_id, place_id2 } = useParams()
      const [searchParams] = useSearchParams()
      const { pathname } = useLocation()
      const editingField = searchParams.get('editingField')
      const { db } = useElectric()!

      const { results: fields = [] } = useLiveQuery(
        db.fields.liveMany({
          where: {
            table_name: table,
            // TODO: need to filter by level
            level: table === 'places' ? (place_id ? 2 : 1) : place_id2 ? 2 : 1,
            project_id: isAccountTable ? null : project_id,
          },
        }),
      )
      const { results: fieldTypes = [] } = useLiveQuery(
        db.field_types.liveMany({
          where: {
            field_type_id: {
              in: fields.map((field) => field.field_type_id),
            },
          },
        }),
      )
      const { results: widgetTypes = [] } = useLiveQuery(
        db.widget_types.liveMany({
          where: {
            widget_type_id: {
              in: fields.map((field) => field.widget_type_id),
            },
          },
        }),
      )

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
          const filterField = `${snakeToCamel(table)}${level ? `${level}` : ''}`

          console.log('Jsonb, onChange 1:', {
            name,
            value,
            val,
            table,
            idField,
            id,
            isFilter,
            level,
            filterField,
            jsonFieldName,
          })

          if (isFilter) {
            // TODO: wait until new db and it's accessing lib. Then implement these queries
            // when filtering no id is passed for the row
            // how to filter on jsonb fields?
            // https://discord.com/channels/933657521581858818/1248997155448819775/1248997155448819775
            // example from electric-sql discord: https://discord.com/channels/933657521581858818/1246045111478124645
            // where: { [jsonbFieldName]: { path: ["is_admin"], equals: true } },
            const filterAtom =
              stores[
                `${snakeToCamel(table)}${level ? `${level}` : ''}FilterAtom`
              ]
            console.log('Jsonb, onChange 3, filterUpdateFunction:', filterAtom)
            const activeFilter = stores.store.get(filterAtom)
            console.log('Jsonb, onChange 4, activeFilter:', activeFilter)
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

      // What if data contains keys not existing in fields? > show but warn
      const fieldNamesDefined = fields.map((field) => field.name)
      const dataKeys = Object.keys(data)
      const dataKeysNotDefined = dataKeys.filter(
        (dataKey) => !fieldNamesDefined.includes(dataKey),
      )

      const widgetsFromDataFieldsDefined = fields.map((field, index) => {
        if (editingField === field.field_id) {
          return (
            <FieldFormInForm
              key={field.field_id}
              field={field}
            />
          )
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

        switch (widgetType?.name) {
          case 'text':
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
          case 'textarea':
            return (
              <TextArea
                key={`${name}/${index}`}
                label={field_label}
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
                label={field_label}
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
                label={field_label}
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
                label={field_label}
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
                label={field_label}
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
                label={field_label}
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
      })

      const fieldsFromDataKeysNotDefined = dataKeysNotDefined.map(
        (dataKey, index) => {
          return (
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
          )
        },
      )

      return [
        widgetsFromDataFieldsDefined,
        fieldsFromDataKeysNotDefined,
        <AddField
          key="addField"
          tableName={table}
          level={place_id2 ? 2 : 1}
        />,
      ]
    },
  ),
)
