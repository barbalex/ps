import { memo, useMemo, useCallback } from 'react'
import { Field } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../ElectricProvider'
import { DropdownField } from './DropdownField'
import { idFieldFromTable } from '../../../modules/idFieldFromTable'

// TODO:
// - [ ] add remove button do dropdowns
// - [ ] add add button to whole
export const FieldList = memo(
  ({ name, label, table, fieldsTable, id, valueArray = [] }) => {
    const { project_id } = useParams()

    const { db } = useElectric()
    const { results: fields = [] } = useLiveQuery(
      () =>
        db.fields.liveMany({
          where: {
            table_name: fieldsTable,
            project_id,
            deleted: false,
          },
        }),
      [project_id, fieldsTable],
    )
    const options = useMemo(() => fields.map(({ name }) => name), [fields])
    const unusedOptions = useMemo(
      () => options.filter((o) => !valueArray.includes(o)),
      [options, valueArray],
    )

    const onChange = useCallback(
      ({ value, previousValue }) => {
        let val = [...valueArray]
        if (!value) {
          // need to remove the key from the json object
          val = val.filter((v) => v !== previousValue)
        } else {
          // replace the previous value with the new value
          const index = val.findIndex((v) => v === previousValue)
          if (index !== -1) {
            val[index] = value
          } else {
            val.push(value)
          }
        }
        const idField = idFieldFromTable(table)
        console.log('FieldList onChange', {
          table,
          idField,
          id,
          name,
          val,
          value,
          previousValue,
        })
        db[table].update({
          where: { [idField]: id },
          data: { [name]: val },
        })
      },
      [db, id, name, table, valueArray],
    )

    return (
      <div className="field-list">
        <Field label={label ?? '(no label provided)'}>
          {valueArray.map((value) => (
            <DropdownField
              key={value}
              value={value ?? ''}
              onChange={onChange}
              options={[...unusedOptions, value]}
            />
          ))}
          {unusedOptions.length > 0 && (
            <Field label="Add new option">
              <DropdownField
                value={''}
                onChange={onChange}
                options={unusedOptions}
              />
            </Field>
          )}
        </Field>
      </div>
    )
  },
)
