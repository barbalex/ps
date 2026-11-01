import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field, TagGroup, Tag } = fluentUiReactComponents
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
  // the column holds a comma separated list (seeds may also write a jsonb
  // array or a postgres array literal) - see usePlacesNavData
  value: string | string[] | null | undefined
  from: string
}

type TagGroupProps = React.ComponentProps<typeof TagGroup>

const toArray = (value: Props['value']): string[] =>
  Array.isArray(value) ? value.map(String).filter(Boolean)
  : typeof value === 'string' ?
    value
      .replace(/^\{|\}$/g, '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  : []

export const FieldList = ({
  name,
  label,
  table,
  fieldsTable,
  id,
  value,
}: Props) => {
  const valueArray = toArray(value)
  const { projectId } = useParams({ strict: false })

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
  const fieldNames = (res?.rows ?? []) as { name: string }[]
  const options = fieldNames.map(({ name }) => name)
  const unusedOptions = options.filter((o) => !valueArray.includes(o))

  const save = async (next: string[]) => {
    const idField = idFieldFromTable(table)
    const joined = next.length ? next.join(',') : null
    const prevRes = await db.query(
      `SELECT * FROM ${table} WHERE ${idField} = $1`,
      [id],
    )
    const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
    await db.query(`UPDATE ${table} SET ${name} = $1 WHERE ${idField} = $2`, [
      joined,
      id,
    ])
    addOperation({
      table,
      rowIdName: idField,
      rowId: id,
      operation: 'update',
      draft: { [name]: joined },
      prev,
    })
  }

  const removeItem: TagGroupProps['onDismiss'] = (_e, { value: removed }) =>
    void save(valueArray.filter((v) => v !== removed))

  const onChange = ({
    value: next,
    previousValue,
  }: {
    value?: string
    previousValue?: string
  }) => {
    let val = [...valueArray]
    if (!next) {
      val = val.filter((v) => v !== previousValue)
    } else {
      // replace the previous value with the new value
      const index = val.findIndex((v) => v === previousValue)
      if (index !== -1) {
        val[index] = next
      } else {
        val.push(next)
      }
    }
    void save(val)
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
