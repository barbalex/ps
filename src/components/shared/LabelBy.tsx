import { useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { DropdownFieldSimpleOptions } from './DropdownFieldSimpleOptions'

import '../../form.css'

export const LabelBy = memo(
  ({ onChange, value, extraFieldNames = [], table, label, name }) => {
    const { db } = useElectric()
    const { project_id } = useParams()

    const { results: fields = [] } = useLiveQuery(
      db.fields.liveMany({
        where: {
          table_name: table,
          project_id: ['files', 'projects'].includes(table) ? null : project_id,
          deleted: false,
        },
      }),
    )
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
