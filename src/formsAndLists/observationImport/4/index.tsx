import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { DropdownFieldSimpleOptions } from '../../../components/shared/DropdownFieldSimpleOptions.tsx'
import { DropdownFieldOptions } from '../../../components/shared/DropdownFieldOptions.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/$observationImportId/'

export const Four = ({ observationImport, occurrenceFields, onChange }) => {
  const { observationImportId, subprojectId } = useParams({ from })

  const res = useLiveQuery(
    `SELECT 
        observation_import_id,
        label, 
        observation_import_id AS value 
      FROM observation_imports 
      WHERE 
        observation_import_id <> $1 
        AND subproject_id = $2 
      ORDER BY label`,
    [observationImportId, subprojectId],
  )
  const observationImportOptions: {
    observation_import_id: string
    label: string
    value: string
  }[] = res?.rows ?? []

  // TODO: move previous import operation to a separate component
  return (
    <>
      <DropdownFieldSimpleOptions
        label="ID Field"
        name="id_field"
        value={observationImport.id_field ?? ''}
        onChange={onChange}
        options={occurrenceFields}
        validationMessage={
          <>
            <div>
              The field that identifies the observation inside the data source
            </div>
            <div>Needed when same occurrences are imported more than once</div>
            <div>
              Enables choosing whether to update existing occurrences or replace
              them
            </div>
          </>
        }
      />
      {!!observationImportOptions.length && (
        <>
          <DropdownFieldOptions
            label="Previous import"
            name="previous_import"
            options={observationImportOptions}
            value={observationImport.previous_import ?? ''}
            onChange={onChange}
            validationMessage="Have occurrences been previously imported from the same source? If so: choose the previous import. If not: leave empty."
          />
        </>
      )}
    </>
  )
}
