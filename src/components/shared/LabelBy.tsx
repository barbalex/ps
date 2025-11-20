import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { DropdownFieldSimpleOptions } from './DropdownFieldSimpleOptions.tsx'

import '../../form.css'

interface Props {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
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
  from,
}: Props) => {
  const { projectId } = useParams({ from })

  const res = useLiveIncrementalQuery(
    `SELECT * FROM fields WHERE table_name = $1 AND project_id = $2`,
    [table, ['files', 'projects'].includes(table) ? null : projectId],
    'field_id',
  )
  const fields = res?.rows ?? []
  // Could add some fields from root here if needed
  const fieldNames = [
    ...fields.map(({ name }) => name),
    ...extraFieldNames,
  ].sort()

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
