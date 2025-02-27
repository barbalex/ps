import { memo, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions.tsx'
import { DropdownFieldOptions } from '../../components/shared/DropdownFieldOptions.tsx'
const previousImportOperations = ['update_and_extend', 'replace']

export const Four = memo(({ occurrenceImport, occurrenceFields, onChange }) => {
  const { occurrence_import_id, subproject_id } = useParams()

  const result = useLiveIncrementalQuery(
    `SELECT 
        occurrence_import_id,
        label, 
        occurrence_import_id as value 
      FROM occurrence_imports 
      WHERE 
        occurrence_import_id <> $1 
        AND subproject_id = $2 
      order by label asc`,
    [occurrence_import_id, subproject_id],
    'occurrence_import_id',
  )
  const occurrenceImportOptions = useMemo(() => result?.rows ?? [], [result])

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
      {!!occurrenceImportOptions.length && (
        <>
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
            list={previousImportOperations}
            value={occurrenceImport.previous_import_operation ?? ''}
            onChange={onChange}
          />
        </>
      )}
    </>
  )
})
