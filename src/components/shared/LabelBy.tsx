import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { DropdownFieldSimpleOptions } from './DropdownFieldSimpleOptions.tsx'
import '../../form.css'
import type Fields from '../../models/public/Fields.ts'

interface Props {
  onChange: React.ComponentProps<typeof DropdownFieldSimpleOptions>['onChange']
  value: string
  extraFieldNames?: string[]
  table: string
  label?: string
  name: string
  from: string
}

export const LabelBy = ({
  onChange,
  value,
  extraFieldNames = [],
  table,
  label,
  name,
}: Props) => {
  const { projectId } = useParams({ strict: false })

  const res = useLiveQuery(
    `SELECT * FROM fields WHERE table_name = $1 AND project_id = $2`,
    [table, ['files', 'projects'].includes(table) ? null : projectId],
  )
  const fields = (res?.rows ?? []) as unknown as Fields[]
  // Could add some fields from root here if needed
  const fieldNames = [
    ...fields.map(({ name }) => name),
    ...extraFieldNames,
  ].sort() as string[]

  return (
    <DropdownFieldSimpleOptions
      label={label ?? `${table} labeled by`}
      name={name}
      value={value}
      onChange={onChange}
      options={fieldNames}
      validationState="none"
      validationMessage={`If no value is set, ${table} are labeled by id.`}
    />
  )
}
