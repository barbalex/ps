import { useParams, useLocation } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { designingAtom, languageAtom } from '../../store.ts'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { EditingGeometry } from '../../components/shared/EditingGeometry.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

type Validation = {
  state: 'error'
  message: string
}

export const PlaceForm = ({
  onChange,
  validations,
  row,
  orIndex,
  from,
  autoFocusRef,
  withContainer = true,
}: {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  validations?: Record<string, Validation>
  row: Record<string, unknown>
  orIndex?: number
  from: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  withContainer?: boolean
}) => {
  const { formatMessage } = useIntl()
  const { subprojectId, projectId, placeId2 } = useParams({ strict: false })
  const { pathname } = useLocation()
  const isFilter = pathname.endsWith('filter')
  const [designing] = useAtom(designingAtom)
  const [language] = useAtom(languageAtom)

  const level = placeId2 || from.includes('/$placeId_/places') ? 2 : 1
  const nameRes = useLiveQuery(
    `SELECT name_singular_${language} FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, level],
  )
  const nameSingular =
    (nameRes?.rows?.[0]?.[`name_singular_${language}`] as string | undefined) ??
    'Population'

  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)

  // TODO: only show parent place if level 2 exists in place_levels
  const parentPlaceWhere = `level = 1 and subproject_id = '${subprojectId}'`

  const content = (
    <>
      {!isFilter && designing && (
        <RadioGroupField
          label={formatMessage({ id: 'bDeHkI', defaultMessage: 'Stufe' })}
          name="level"
          list={[1, 2] as unknown as string[]}
          value={(row.level ?? '') as unknown as string}
          onChange={onChange}
          validationState={validations?.level?.state}
          validationMessage={validations?.level?.message}
        />
      )}
      <TextField
        label={formatMessage({
          id: 'bPlaceNameLabel',
          defaultMessage: 'Name',
        })}
        name="name"
        value={row.name as string | number | undefined}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <TextField
        label={formatMessage(
          {
            id: 'bEmMrR',
            defaultMessage: 'Seit welchem Jahr existiert die {nameSingular}?',
          },
          { nameSingular },
        )}
        name="since"
        value={row.since as string | number | undefined}
        type="number"
        onChange={onChange}
        validationState={validations?.since?.state}
        validationMessage={validations?.since?.message}
      />
      <TextField
        label={formatMessage(
          {
            id: 'bEnNsS',
            defaultMessage:
              'Bis zu welchem Jahr existierte die {nameSingular}?',
          },
          { nameSingular },
        )}
        name="until"
        value={row.until as string | number | undefined}
        type="number"
        onChange={onChange}
        validationState={validations?.until?.state}
        validationMessage={validations?.until?.message}
      />
      {!isFilter && (
        <>
          {row.level === 2 && (
            <DropdownField
              label={formatMessage({
                id: 'bElLqQ',
                defaultMessage: 'Übergeordneter Ort',
              })}
              name="parent_id"
              idField="place_id"
              table="places"
              where={parentPlaceWhere}
              value={row.parent_id ?? ''}
              onChange={onChange}
              autoFocus
              ref={autoFocusRef}
              validationState={validations?.parent_id?.state}
              validationMessage={validations?.parent_id?.message}
            />
          )}
        </>
      )}
      <Jsonb
        table="places"
        idField="place_id"
        id={row.place_id as string}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
      />
      <SwitchField
        label={formatMessage({
          id: 'bEpPuU',
          defaultMessage: 'Relevant für Berichte',
        })}
        name="relevant_for_reports"
        value={row.relevant_for_reports as never}
        onChange={onChange}
        validationState={validations?.relevant_for_reports?.state}
        validationMessage={validations?.relevant_for_reports?.message}
      />
      <EditingGeometry
        row={row as Parameters<typeof EditingGeometry>[0]['row']}
        table="places"
      />
    </>
  )

  if (!withContainer) return content

  return <div className="form-container">{content}</div>
}
