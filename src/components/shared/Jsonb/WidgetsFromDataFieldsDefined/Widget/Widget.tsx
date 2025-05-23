import { memo, useCallback } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'
import { useParams, useLocation } from '@tanstack/react-router'

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
import { filterAtomNameFromTableAndLevel } from '../../../../../modules/filterAtomNameFromTableAndLevel.ts'
import { setNewFilterFromOld } from '../../../../../modules/setNewFilterFromOld.ts'

// this component focuses on creating the widgets
export const Widget = memo(
  ({
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
    from,
  }) => {
    const { placeId, placeId2 } = useParams({ from })
    const location = useLocation()
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

        const isFilter = location.pathname.endsWith('filter')

        if (isFilter) {
          const level =
            table === 'places' ?
              placeId ? 2
              : 1
            : placeId2 ? 2
            : 1
          const filterName = filterAtomNameFromTableAndLevel({ table, level })
          const filterAtom = stores[filterName]
          const orFilters = stores.store.get(filterAtom)
          return setNewFilterFromOld({
            name: `data.${name}`,
            value: val[name],
            orFilters,
            orIndex,
            filterName,
            targetType: field.field_type,
          })
        }
        const sql = `update ${table} set ${jsonFieldName} = $1 where ${idField} = $2`
        try {
          await db.query(sql, [val, id])
        } catch (error) {
          console.log(`Jsonb, error updating table '${table}':`, error)
        }
        return
      },
      [
        data,
        location.pathname,
        table,
        jsonFieldName,
        idField,
        placeId,
        placeId2,
        orIndex,
        field.field_type,
        db,
        id,
      ],
    )

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
            value={value}
            type={type ?? 'text'}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      case 'jes-no':
        return (
          <SwitchField
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      case 'checkbox-2':
        return (
          <CheckboxField
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      case 'checkbox-3':
        return (
          <CheckboxField
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
            indeterminate={true}
          />
        )
      case 'textarea':
        return (
          <TextArea
            label={label}
            name={name}
            value={value}
            type={type ?? 'text'}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      case 'dropdown':
        return (
          <DropdownField
            name={name}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      case 'options-many':
        return (
          <DropdownFieldFromList
            name={name}
            label={label}
            list_id={field.list_id}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      case 'options-few':
        return (
          <RadioGroupFromList
            name={name}
            label={label}
            list_id={field.list_id}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      case 'datepicker':
        return (
          <DateField
            label={label}
            name={name}
            // in json date is saved as iso string
            value={value ? new Date(value) : null}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      case 'timepicker':
        return (
          <TimeFields
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      case 'datetimepicker':
        return (
          <DateTimeField
            label={label}
            name={name}
            value={value ? new Date(value) : null}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
      default:
        return (
          <TextField
            label={label}
            name={name}
            value={value}
            type={type ?? 'text'}
            onChange={onChange}
            autoFocus={autoFocus}
            ref={ref}
            button={<EditField fieldId={field.field_id} />}
          />
        )
    }
  },
)
