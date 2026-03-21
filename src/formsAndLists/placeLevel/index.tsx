import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { SectionDescription } from '../../components/shared/SectionDescription.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { updateTableVectorLayerLabels } from '../../modules/updateTableVectorLayerLabels.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type PlaceLevels from '../../models/public/PlaceLevels.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/place-levels/$placeLevelId/'

export const PlaceLevel = () => {
  const { placeLevelId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM place_levels WHERE place_level_id = $1`,
    [placeLevelId],
  )
  const row: PlaceLevels | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE place_levels SET ${name} = $1 WHERE place_level_id = $2`,
        [value, placeLevelId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'place_levels',
      rowIdName: 'place_level_id',
      rowId: placeLevelId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
    // if name fields changed, need to update the label of corresponding vector layers
    if (
      row &&
      [
        'name_plural_de',
        'name_plural_en',
        'name_plural_fr',
        'name_plural_it',
        'name_singular_de',
        'name_singular_en',
        'name_singular_fr',
        'name_singular_it',
        'actions',
        'checks',
        'observations',
      ].includes(name) &&
      row.level &&
      row.project_id
    ) {
      await updateTableVectorLayerLabels({
        project_id: row.project_id,
      })
    }
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'Lf+2pw', defaultMessage: 'Ort-Stufe' })}
        id={placeLevelId}
      />
    )
  }

  // console.log('place level', row)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <SectionDescription marginTop={-10}>
          {formatMessage({
            id: 'pR0UwN',
            defaultMessage:
              'Es können ein oder zwei Ort-Stufen definiert werden. Beispiel für Arten: Population/Teil-Population.',
          })}
        </SectionDescription>
        <RadioGroupField
          label={formatMessage({ id: 'Lv9nRx', defaultMessage: 'Stufe' })}
          name="level"
          list={[1, 2]}
          value={row.level ?? ''}
          onChange={onChange}
          validationState={validations?.level?.state}
          validationMessage={validations?.level?.message}
        />
        <Section
          title={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        >
          <SectionDescription>
            {formatMessage({
              id: 'nP8QrS',
              defaultMessage:
                'Hier wird der Name für diese Ort-Stufe definiert. Damit er überall korrekt angezeigt werden kann, braucht es Einzahl, Mehrzahl und Kurzform, in allen verwendeten Sprachen. Fehlt eine Sprache, wird Deutsch verwendet.',
            })}
          </SectionDescription>
          <TextField
            label={formatMessage({
              id: 'bT3YsO',
              defaultMessage: 'Deutsch (Einzahl)',
            })}
            name="name_singular_de"
            value={row.name_singular_de ?? ''}
            onChange={onChange}
            autoFocus
            ref={autoFocusRef}
            validationState={validations?.name_singular_de?.state}
            validationMessage={validations?.name_singular_de?.message}
          />
          <TextField
            label={formatMessage({
              id: 'cU4ZtP',
              defaultMessage: 'Deutsch (Mehrzahl)',
            })}
            name="name_plural_de"
            value={row.name_plural_de ?? ''}
            onChange={onChange}
            validationState={validations?.name_plural_de?.state}
            validationMessage={validations?.name_plural_de?.message}
          />
          <TextField
            label={formatMessage({
              id: 'dV5AuQ',
              defaultMessage: 'Deutsch (Kurzform)',
            })}
            name="name_short_de"
            value={row.name_short_de ?? ''}
            onChange={onChange}
            validationState={validations?.name_short_de?.state}
            validationMessage={validations?.name_short_de?.message}
          />
          <TextField
            label={formatMessage({
              id: 'eW6BvR',
              defaultMessage: 'Englisch (Einzahl)',
            })}
            name="name_singular_en"
            value={row.name_singular_en ?? ''}
            onChange={onChange}
            validationState={validations?.name_singular_en?.state}
            validationMessage={validations?.name_singular_en?.message}
          />
          <TextField
            label={formatMessage({
              id: 'fX7CwS',
              defaultMessage: 'Englisch (Mehrzahl)',
            })}
            name="name_plural_en"
            value={row.name_plural_en ?? ''}
            onChange={onChange}
            validationState={validations?.name_plural_en?.state}
            validationMessage={validations?.name_plural_en?.message}
          />
          <TextField
            label={formatMessage({
              id: 'gY8DxT',
              defaultMessage: 'Englisch (Kurzform)',
            })}
            name="name_short_en"
            value={row.name_short_en ?? ''}
            onChange={onChange}
            validationState={validations?.name_short_en?.state}
            validationMessage={validations?.name_short_en?.message}
          />
          <TextField
            label={formatMessage({
              id: 'hZ9EyU',
              defaultMessage: 'Französisch (Einzahl)',
            })}
            name="name_singular_fr"
            value={row.name_singular_fr ?? ''}
            onChange={onChange}
            validationState={validations?.name_singular_fr?.state}
            validationMessage={validations?.name_singular_fr?.message}
          />
          <TextField
            label={formatMessage({
              id: 'iA0FzV',
              defaultMessage: 'Französisch (Mehrzahl)',
            })}
            name="name_plural_fr"
            value={row.name_plural_fr ?? ''}
            onChange={onChange}
            validationState={validations?.name_plural_fr?.state}
            validationMessage={validations?.name_plural_fr?.message}
          />
          <TextField
            label={formatMessage({
              id: 'jB1GaW',
              defaultMessage: 'Französisch (Kurzform)',
            })}
            name="name_short_fr"
            value={row.name_short_fr ?? ''}
            onChange={onChange}
            validationState={validations?.name_short_fr?.state}
            validationMessage={validations?.name_short_fr?.message}
          />
          <TextField
            label={formatMessage({
              id: 'kC2HbX',
              defaultMessage: 'Italienisch (Einzahl)',
            })}
            name="name_singular_it"
            value={row.name_singular_it ?? ''}
            onChange={onChange}
            validationState={validations?.name_singular_it?.state}
            validationMessage={validations?.name_singular_it?.message}
          />
          <TextField
            label={formatMessage({
              id: 'lD3IcY',
              defaultMessage: 'Italienisch (Mehrzahl)',
            })}
            name="name_plural_it"
            value={row.name_plural_it ?? ''}
            onChange={onChange}
            validationState={validations?.name_plural_it?.state}
            validationMessage={validations?.name_plural_it?.message}
          />
          <TextField
            label={formatMessage({
              id: 'mE4JdZ',
              defaultMessage: 'Italienisch (Kurzform)',
            })}
            name="name_short_it"
            value={row.name_short_it ?? ''}
            onChange={onChange}
            validationState={validations?.name_short_it?.state}
            validationMessage={validations?.name_short_it?.message}
          />
        </Section>
        <Section
          title={formatMessage({ id: 'yR6TsL', defaultMessage: 'Fähigkeiten' })}
        >
          <SectionDescription>
            {formatMessage({
              id: 'qS1VxO',
              defaultMessage:
                'Sie können die folgenden Fähigkeiten nach Ihren Bedürfnissen ein- oder ausschalten. Nicht benötigte deaktivieren vereinfacht die Benutzeroberfläche.',
            })}
          </SectionDescription>
          <SwitchField
            label={formatMessage({
              id: 'nF5KeA',
              defaultMessage: 'Berichte',
            })}
            name="reports"
            value={row.reports ?? false}
            onChange={onChange}
            validationState={validations?.reports?.state}
            validationMessage={validations?.reports?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'oG6LfB',
              defaultMessage: 'Bericht-Mengen',
            })}
            name="report_values"
            value={row.report_values ?? false}
            onChange={onChange}
            validationState={validations?.report_values?.state}
            validationMessage={validations?.report_values?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'pH7MgC',
              defaultMessage: 'Massnahmen',
            })}
            name="actions"
            value={row.actions ?? false}
            onChange={onChange}
            validationState={validations?.actions?.state}
            validationMessage={validations?.actions?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'qI8NhD',
              defaultMessage: 'Massnahmen-Mengen',
            })}
            name="action_quantities"
            value={row.action_quantities ?? false}
            onChange={onChange}
            validationState={validations?.action_quantities?.state}
            validationMessage={validations?.action_quantities?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'rJ9OiE',
              defaultMessage: 'Massnahmenberichte',
            })}
            name="action_reports"
            value={row.action_reports ?? false}
            onChange={onChange}
            validationState={validations?.action_reports?.state}
            validationMessage={validations?.action_reports?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'sK0PjF',
              defaultMessage: 'Kontrollen',
            })}
            name="checks"
            value={row.checks ?? false}
            onChange={onChange}
            validationState={validations?.checks?.state}
            validationMessage={validations?.checks?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'tL1QkG',
              defaultMessage: 'Kontroll-Mengen',
            })}
            name="check_quantities"
            value={row.check_quantities ?? false}
            onChange={onChange}
            validationState={validations?.check_quantities?.state}
            validationMessage={validations?.check_quantities?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'uM2RlH',
              defaultMessage: 'Kontroll-Taxa',
            })}
            name="check_taxa"
            value={row.check_taxa ?? false}
            onChange={onChange}
            validationState={validations?.check_taxa?.state}
            validationMessage={validations?.check_taxa?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'vN3SmI',
              defaultMessage: 'Beobachtungen',
            })}
            name="observations"
            value={row.observations ?? false}
            onChange={onChange}
            validationState={validations?.observations?.state}
            validationMessage={validations?.observations?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'aB1CdE',
              defaultMessage: 'Ort-Dateien',
            })}
            name="place_files"
            value={row.place_files ?? false}
            onChange={onChange}
            validationState={validations?.place_files?.state}
            validationMessage={validations?.place_files?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'fG2HiJ',
              defaultMessage: 'Massnahmen-Dateien',
            })}
            name="action_files"
            value={row.action_files ?? false}
            onChange={onChange}
            validationState={validations?.action_files?.state}
            validationMessage={validations?.action_files?.message}
          />
          <SwitchField
            label={formatMessage({
              id: 'kL3MnO',
              defaultMessage: 'Kontroll-Dateien',
            })}
            name="check_files"
            value={row.check_files ?? false}
            onChange={onChange}
            validationState={validations?.check_files?.state}
            validationMessage={validations?.check_files?.message}
          />
        </Section>
      </div>
    </div>
  )
}
