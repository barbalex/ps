import { memo, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions'
import { DropdownFieldOptions } from '../../components/shared/DropdownFieldOptions'

export const Four = memo(({ occurrenceImport, occurrenceFields, onChange }) => {
  const { occurrence_import_id, subproject_id } = useParams()

  const { db } = useElectric()!
  const { results: occurrenceImports = [] } = useLiveQuery(
    db.occurrence_imports.liveMany({
      where: {
        subproject_id,
        occurrence_import_id: { not: occurrence_import_id },
      },
      orderBy: { label: 'asc' },
    }),
  )
  const occurrenceImportOptions = useMemo(
    () =>
      occurrenceImports.map((o) => ({
        label: o.label,
        value: o.occurrence_import_id,
      })),
    [occurrenceImports],
  )

  if (!occurrenceImport) {
    return <div>Loading...</div>
  }

  return (
    <>
      <DropdownFieldSimpleOptions
        label="ID Field"
        name="id_field"
        value={occurrenceImport.id_field ?? ''}
        onChange={onChange}
        options={occurrenceFields}
        validationMessage={
          <>
            <div>The field that identifies the occurrence</div>
            <div>Needed when same occurrences are imported more than once</div>
            <div>Enables choosing how to deal with a previous import</div>
          </>
        }
      />
      <DropdownFieldOptions
        label="Previous import"
        name="previous_import"
        options={occurrenceImportOptions}
        value={occurrenceImport.previous_import ?? ''}
        onChange={onChange}
        validationMessage="Have occurrences been previously imported from the same source? If so: choose the previous import. If not: leave empty."
      />
      <RadioGroupField
        label="How to deal with a previous import"
        name="previous_import_operation"
        list={['update_and_extend', 'replace']}
        value={occurrenceImport.previous_import_operation ?? ''}
        onChange={onChange}
      />
    </>
  )
})
