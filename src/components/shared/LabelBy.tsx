import { useLiveQuery } from '@electric-sql/pglite-react'

import { DropdownFieldSimpleOptions } from './DropdownFieldSimpleOptions.tsx'
import '../../form.css'
import type Fields from '../../models/public/Fields.ts'

interface Props {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  value: string
  extraFieldNames?: string[]
  table: string
  label?: string
  name: string
}

export const LabelBy = ({
  onChange,
  value,
  extraFieldNames = [],
  table,
  label,
  name,
}: Props) => {
  const res = useLiveQuery(`SELECT * FROM fields WHERE table_name = $1`, [
    table,
  ])
  const fields: Fields[] = res?.rows ?? []
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
