import { useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'

import { DropdownFieldSimpleOptions } from './DropdownFieldSimpleOptions.tsx'

import '../../form.css'

interface Props {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  value: string
  extraFieldNames?: string[]
  table: string
  label?: string
  name: string
}

export const LabelBy = memo(
  ({ onChange, value, extraFieldNames = [], table, label, name }: Props) => {
    const { project_id } = useParams()

    const res = useLiveQuery(
      `SELECT * FROM fields WHERE table_name = $1 AND project_id = $2`,
      [table, ['files', 'projects'].includes(table) ? null : project_id],
    )
    const fields = useMemo(() => res?.rows ?? [], [res])
    // Could add some fields from root here if needed
    const fieldNames = useMemo(
      () => [...fields.map(({ name }) => name), ...extraFieldNames].sort(),
      [extraFieldNames, fields],
    )

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
  },
)
