import { memo, useMemo, useCallback } from 'react'
import { Field, TagGroup, Tag } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { DropdownField } from './DropdownField.tsx'
import { idFieldFromTable } from '../../../modules/idFieldFromTable.ts'

interface Props {
  name: string
  label: string
  table: string
  fieldsTable: string
  id: string
  valueArray: string[]
}

export const FieldList = memo(
  ({ name, label, table, fieldsTable, id, valueArray = [] }: Props) => {
    const { project_id } = useParams()

    const db = usePGlite()
    const res = useLiveIncrementalQuery(
      `
      SELECT name 
      FROM fields 
      WHERE project_id = $1 AND table_name = $2 
      ORDER BY table_name, label`,
      [project_id, fieldsTable],
      'field_id',
    )
    const fields = useMemo(() => res?.rows ?? [], [res])
    const options = useMemo(() => fields.map(({ name }) => name), [fields])
    const unusedOptions = useMemo(
      () => options.filter((o) => !valueArray.includes(o)),
      [options, valueArray],
    )

    const removeItem = useCallback(
      (e, { value }) => {
        const idField = idFieldFromTable(table)
        // TODO: test
        db.query(
          `UPDATE ${table} SET data = jsonb_set(data, '{${name}}', $1) WHERE ${idField} = $2`,
          [valueArray.filter((v) => v !== value), id],
        )
      },
      [db, id, name, table, valueArray],
    )

    const onChange = useCallback<InputProps['onChange']>(
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
        db.query(
          `UPDATE ${table} SET data = jsonb_set(data, '{${name}}', $1) WHERE ${idField} = $2`,
          [val, id],
        )
      },
      [db, id, name, table, valueArray],
    )

    return (
      <Field
        label={label ?? '(no label provided)'}
        validationState="none"
        validationMessage={
          <>
            <div>{`Add multiple items in the order you want ${fieldsTable} to be ordered.`}</div>
            <div>{`If no value is set, ${fieldsTable} are ordered by label.`}</div>
          </>
        }
      >
        <TagGroup onDismiss={removeItem}>
          {valueArray.map((value) => (
            <Tag
              key={value}
              dismissible
              dismissIcon={{ 'aria-label': 'remove' }}
              value={value}
              secondaryText={
                !options.includes(value) ? 'not defined in fields' : undefined
              }
            >
              {value}
            </Tag>
          ))}
          {unusedOptions.length > 0 && (
            <DropdownField
              placeholder="Select an option"
              value={''}
              onChange={onChange}
              options={unusedOptions}
            />
          )}
        </TagGroup>
      </Field>
    )
  },
)
