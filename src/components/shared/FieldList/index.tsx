import { Field, TagGroup, Tag } from '@fluentui/react-components'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { DropdownField } from './DropdownField.tsx'
import { idFieldFromTable } from '../../../modules/idFieldFromTable.ts'
import { addOperationAtom } from '../../../store.ts'

interface Props {
  name: string
  label: string
  table: string
  fieldsTable: string
  id: string
  valueArray: string[]
  from: string
}

export const FieldList = ({
  name,
  label,
  table,
  fieldsTable,
  id,
  valueArray = [],
  from,
}: Props) => {
  const { projectId } = useParams({ from })

  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()
  const res = useLiveQuery(
    `
      SELECT name 
      FROM fields 
      WHERE project_id = $1 AND table_name = $2 
      ORDER BY table_name, label`,
    [projectId, fieldsTable],
  )
  const fieldNames: { name: string }[] = res?.rows ?? []
  const options = fieldNames.map(({ name }) => name)
  const unusedOptions = options.filter((o) => !valueArray.includes(o))

  const removeItem = async (e, { value }) => {
    const idField = idFieldFromTable(table)
    const data = valueArray.filter((v) => v !== value)
    // TODO: test
    const prevRes = await db.query(
      `SELECT * FROM ${table} WHERE ${idField} = $1`,
      [id],
    )
    const prev = prevRes?.rows?.[0] || {}
    db.query(
      `UPDATE ${table} SET data = jsonb_set(data, '{${name}}', $1) WHERE ${idField} = $2`,
      [data, id],
    )
    addOperation({
      table,
      rowIdName: idField,
      rowId: id,
      operation: 'update',
      draft: {
        data: {
          ...(prev.data || {}),
          [name]: valueArray.filter((v) => v !== value),
        },
      },
      prev,
    })
  }

  const onChange = async ({ value, previousValue }) => {
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
    const prevRes = await db.query(
      `SELECT * FROM ${table} WHERE ${idField} = $1`,
      [id],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(
      `UPDATE ${table} SET data = jsonb_set(data, '{${name}}', $1) WHERE ${idField} = $2`,
      [val, id],
    )
    addOperation({
      table,
      rowIdName: idField,
      rowId: id,
      operation: 'update',
      draft: {
        data: {
          ...(prev.data || {}),
          [name]: val,
        },
      },
      prev,
    })
  }

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
}
