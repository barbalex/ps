import { useParams, useLocation } from '@tanstack/react-router'
import type Places from '../../models/public/Places.ts'
import { useIntl } from 'react-intl'
import { useAtom } from 'jotai'
import { useNavRollups } from '../../modules/navRollupsContext.ts'

import { designingAtom, languageAtom } from '../../store.ts'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { JsonbOrFormDesign } from '../../components/shared/FormDesign/index.tsx'
import { WithFormDesign } from '../../components/shared/FormDesign/WithFormDesign.tsx'
import { FormColumn } from '../../components/shared/FormDesign/FormColumn.tsx'
import type { FormColumns } from '../../components/shared/FormDesign/FormDesignRuntimeContext.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'
import type { FieldChangeHandler } from '../../components/shared/fieldChange.ts'

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
  onChange: FieldChangeHandler
  validations?: Record<string, Validation>
  row: Places | Record<string, never>
  orIndex?: number
  from: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  withContainer?: boolean
}) => {
  const { formatMessage } = useIntl()
  const { subprojectId, projectId, placeId2 } = useParams({ strict: false })
  const { pathname } = useLocation()
  const isFilter = pathname.endsWith('filter')
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const [language] = useAtom(languageAtom)

  const level = placeId2 || from.includes('/$placeId_/places') ? 2 : 1
  const { placeLevel } = useNavRollups()
  const nameSingular =
    placeLevel(projectId!, level)?.[`name_singular_${language}`] ?? 'Population'

  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)

  // TODO: only show parent place if level 2 exists in place_levels
  const parentPlaceWhere = `level = 1 and subproject_id = '${subprojectId}'`

  // the table's real columns: placeable in a form design like the jsonb
  // keys, and drawn at their fixed position until a design places them.
  // Columns that do not apply are left out — they then render nowhere
  const columns: FormColumns = {
    // the level is a designing tool: placeable while designing only
    ...(designing &&
      !isFilter && {
        level: {
          label: formatMessage({ id: 'bDeHkI', defaultMessage: 'Stufe' }),
          render: ({ label, onChange }) => (
            <RadioGroupField
              label={label}
              name="level"
              list={[1, 2] as unknown as string[]}
              value={(row.level ?? '') as unknown as string}
              onChange={onChange}
              validationState={validations?.level?.state}
              validationMessage={validations?.level?.message}
            />
          ),
        },
      }),
    name: {
      label: formatMessage({
        id: 'bPlaceNameLabel',
        defaultMessage: 'Name',
      }),
      render: ({ label, onChange }) => (
        <TextField
          label={label}
          name="name"
          value={row.name as string | number | undefined}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.name?.state}
          validationMessage={validations?.name?.message}
        />
      ),
    },
    since: {
      label: formatMessage(
        {
          id: 'bEmMrR',
          defaultMessage: 'Seit welchem Jahr existiert die {nameSingular}?',
        },
        { nameSingular },
      ),
      render: ({ label, onChange }) => (
        <TextField
          label={label}
          name="since"
          value={row.since as string | number | undefined}
          type="number"
          onChange={onChange}
          validationState={validations?.since?.state}
          validationMessage={validations?.since?.message}
        />
      ),
    },
    until: {
      label: formatMessage(
        {
          id: 'bEnNsS',
          defaultMessage: 'Bis zu welchem Jahr existierte die {nameSingular}?',
        },
        { nameSingular },
      ),
      render: ({ label, onChange }) => (
        <TextField
          label={label}
          name="until"
          value={row.until as string | number | undefined}
          type="number"
          onChange={onChange}
          validationState={validations?.until?.state}
          validationMessage={validations?.until?.message}
        />
      ),
    },
    // only a place of level 2 has a parent
    ...(!isFilter &&
      row.level === 2 && {
        parent_id: {
          label: formatMessage({
            id: 'bElLqQ',
            defaultMessage: 'Übergeordneter Ort',
          }),
          render: ({ label, onChange }) => (
            <DropdownField
              label={label}
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
          ),
        },
      }),
    relevant_for_reports: {
      label: formatMessage({
        id: 'bEpPuU',
        defaultMessage: 'Relevant für Berichte',
      }),
      render: ({ label, onChange }) => (
        <SwitchField
          label={label}
          name="relevant_for_reports"
          value={row.relevant_for_reports as boolean | null | undefined}
          onChange={onChange}
          validationState={validations?.relevant_for_reports?.state}
          validationMessage={validations?.relevant_for_reports?.message}
        />
      ),
    },
  }

  const content = (
    <WithFormDesign
      table="places"
      idField="place_id"
      id={row.place_id as string}
      data={jsonbData}
      from={from}
      columns={columns}
      onChange={onChange}
    >
      <FormColumn column="level" />
      <FormColumn column="name" />
      <FormColumn column="since" />
      <FormColumn column="until" />
      <FormColumn column="parent_id" />
      <JsonbOrFormDesign
        table="places"
        idField="place_id"
        id={row.place_id as string}
        data={jsonbData}
        orIndex={orIndex}
        from={from}
      />
      <FormColumn column="relevant_for_reports" />
    </WithFormDesign>
  )

  if (!withContainer) return content

  return <div className="form-container">{content}</div>
}
