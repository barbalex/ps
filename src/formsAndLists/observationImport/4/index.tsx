import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { DropdownFieldSimpleOptions } from '../../../components/shared/DropdownFieldSimpleOptions.tsx'
import { DropdownFieldOptions } from '../../../components/shared/DropdownFieldOptions.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/$observationImportId/'

export const Four = ({ observationImport, observationFields, onChange }) => {
  const { observationImportId, subprojectId } = useParams({ from })
  const { formatMessage } = useIntl()

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
        label={formatMessage({ id: 'iDFdLb', defaultMessage: 'ID-Feld' })}
        name="id_field"
        value={observationImport.id_field ?? ''}
        onChange={onChange}
        options={observationFields}
        validationMessage={
          <>
            <div>
              {formatMessage({ id: 'iDFdV1', defaultMessage: 'Das Feld, das die Beobachtung in der Datenquelle identifiziert.' })}
            </div>
            <div>{formatMessage({ id: 'iDFdV2', defaultMessage: 'Wird benötigt, wenn gleiche Beobachtungen mehrfach importiert werden.' })}</div>
            <div>
              {formatMessage({ id: 'iDFdV3', defaultMessage: 'Ermöglicht die Wahl zwischen Aktualisieren und Ersetzen bestehender Beobachtungen.' })}
            </div>
          </>
        }
      />
      {!!observationImportOptions.length && (
        <>
          <DropdownFieldOptions
            label={formatMessage({ id: 'pvImpLb', defaultMessage: 'Vorheriger Import' })}
            name="previous_import"
            options={observationImportOptions}
            value={observationImport.previous_import ?? ''}
            onChange={onChange}
            validationMessage={formatMessage({ id: 'pvImpVl', defaultMessage: 'Wurden Beobachtungen bereits zuvor aus derselben Quelle importiert? Falls ja: den vorherigen Import auswählen. Falls nein: leer lassen.' })}
          />
        </>
      )}
    </>
  )
}
