import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { DropdownFieldSimpleOptions } from '../../../components/shared/DropdownFieldSimpleOptions.tsx'
import { DropdownFieldOptions } from '../../../components/shared/DropdownFieldOptions.tsx'
import { PreviousImportOperation } from './PreviousImportOperation.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports/$occurrenceImportId/'

export const Four = ({ occurrenceImport, occurrenceFields, onChange }) => {
  const { occurrenceImportId, subprojectId } = useParams({ from })

  const res = useLiveQuery(
    `SELECT 
        occurrence_import_id,
        label, 
        occurrence_import_id AS value 
      FROM occurrence_imports 
      WHERE 
        occurrence_import_id <> $1 
        AND subproject_id = $2 
      ORDER BY label`,
    [occurrenceImportId, subprojectId],
  )
  const occurrenceImportOptions: {
    occurrence_import_id: string
    label: string
    value: string
  }[] = res?.rows ?? []

  // TODO: move previous import operation to a separate component
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
          <PreviousImportOperation onChange={onChange} row={occurrenceImport} />
        </>
      )}
    </>
  )
}
