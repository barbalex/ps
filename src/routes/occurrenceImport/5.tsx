import { useCallback, memo, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { InputProps } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions'
import { DropdownFieldOptions } from '../../components/shared/DropdownFieldOptions'
import { getValueFromChange } from '../../modules/getValueFromChange'

import '../../form.css'

export const Five = memo(({ row }) => {
  const { occurrence_import_id, subproject_id } = useParams()

  const { db } = useElectric()!
  const { results: occurrences = [] } = useLiveQuery(
    db.occurrences.liveMany({
      where: {
        subproject_id,
        deleted: false,
        occurrence_import_id: { not: occurrence_import_id },
      },
      orderBy: { label: 'asc' },
    }),
  )
  const occurrenceOptions = useMemo(
    () =>
      occurrences.map((o) => ({
        label: o.label,
        value: o.occurrence_id,
      })),
    [occurrences],
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.occurrence_imports.update({
        where: { occurrence_import_id },
        data: { [name]: value },
      })
    },
    [db.occurrence_imports, occurrence_import_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <>
      <DropdownFieldSimpleOptions
        label="ID Field"
        name="id_field"
        value={row.id_field ?? ''}
        onChange={onChange}
        options={['TODO:', 'query', 'keys', 'of', 'first', 'occurrence']}
        validationMessage={
          <>
            <div>The field that identifies the occurrence</div>
            <div>Needed when same occurrences are repeatedly imported</div>
          </>
        }
      />
      <DropdownFieldOptions
        label="Previous import"
        name="previous_import"
        options={occurrenceOptions}
        value={row.previous_import ?? ''}
        onChange={onChange}
        validationMessage="Is this a new import from a previously imported occurrence source? If so: choose the previous import. If not: leave empty."
      />
      <RadioGroupField
        label="How to deal with a previous import"
        name="geometry_method"
        list={['update_and_extend', 'replace']}
        value={row.geometry_method ?? ''}
        onChange={onChange}
      />
    </>
  )
})
