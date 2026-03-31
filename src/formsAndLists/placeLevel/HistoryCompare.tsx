import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type PlaceLevels from '../../models/public/PlaceLevels.ts'
import type PlaceLevelsHistory from '../../models/public/PlaceLevelsHistory.ts'

const from =
  '/data/projects/$projectId_/place-levels/$placeLevelId_/histories/$placeLevelHistoryId'

export const PlaceLevelHistoryCompare = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, placeLevelId, placeLevelHistoryId } = useParams({
    from,
    strict: false,
  })
  const placeLevelPath = `/data/projects/${projectId}/place-levels/${placeLevelId}`
  const historyPath = `${placeLevelPath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const [validations, setValidations] = useState<Record<string, unknown>>({})

  const rowRes = useLiveQuery(
    `SELECT * FROM place_levels WHERE place_level_id = $1`,
    [placeLevelId],
  )
  const row = rowRes?.rows?.[0] as PlaceLevels | undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

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
      const { [name]: _unused, ...rest } = prev
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
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'Lf+2pw', defaultMessage: 'Ort-Stufe' })}
        id={placeLevelId}
      />
    )
  }

  const leftContent = (
    <div className="form-container">
      <RadioGroupField
        label={formatMessage({ id: 'Lv9nRx', defaultMessage: 'Stufe' })}
        name="level"
        list={[1, 2]}
        layout="horizontal"
        value={row.level ?? ''}
        onChange={onChange}
        validationState={validations?.level?.state}
        validationMessage={validations?.level?.message}
      />
      <TextField
        label={formatMessage({ id: 'bT3YsO', defaultMessage: 'Deutsch: Einzahl' })}
        name="name_singular_de"
        value={row.name_singular_de ?? ''}
        onChange={onChange}
        validationState={validations?.name_singular_de?.state}
        validationMessage={validations?.name_singular_de?.message}
      />
      <TextField
        label={formatMessage({ id: 'cU4ZtP', defaultMessage: 'Deutsch: Mehrzahl' })}
        name="name_plural_de"
        value={row.name_plural_de ?? ''}
        onChange={onChange}
        validationState={validations?.name_plural_de?.state}
        validationMessage={validations?.name_plural_de?.message}
      />
      <TextField
        label={formatMessage({ id: 'eW6BvR', defaultMessage: 'Englisch: Einzahl' })}
        name="name_singular_en"
        value={row.name_singular_en ?? ''}
        onChange={onChange}
        validationState={validations?.name_singular_en?.state}
        validationMessage={validations?.name_singular_en?.message}
      />
      <TextField
        label={formatMessage({ id: 'fX7CwS', defaultMessage: 'Englisch: Mehrzahl' })}
        name="name_plural_en"
        value={row.name_plural_en ?? ''}
        onChange={onChange}
        validationState={validations?.name_plural_en?.state}
        validationMessage={validations?.name_plural_en?.message}
      />
      <TextField
        label={formatMessage({ id: 'hZ9EyU', defaultMessage: 'Französisch: Einzahl' })}
        name="name_singular_fr"
        value={row.name_singular_fr ?? ''}
        onChange={onChange}
        validationState={validations?.name_singular_fr?.state}
        validationMessage={validations?.name_singular_fr?.message}
      />
      <TextField
        label={formatMessage({ id: 'iA0FzV', defaultMessage: 'Französisch: Mehrzahl' })}
        name="name_plural_fr"
        value={row.name_plural_fr ?? ''}
        onChange={onChange}
        validationState={validations?.name_plural_fr?.state}
        validationMessage={validations?.name_plural_fr?.message}
      />
      <TextField
        label={formatMessage({ id: 'kC2HbX', defaultMessage: 'Italienisch: Einzahl' })}
        name="name_singular_it"
        value={row.name_singular_it ?? ''}
        onChange={onChange}
        validationState={validations?.name_singular_it?.state}
        validationMessage={validations?.name_singular_it?.message}
      />
      <TextField
        label={formatMessage({ id: 'lD3IcY', defaultMessage: 'Italienisch: Mehrzahl' })}
        name="name_plural_it"
        value={row.name_plural_it ?? ''}
        onChange={onChange}
        validationState={validations?.name_plural_it?.state}
        validationMessage={validations?.name_plural_it?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'vN3SmI', defaultMessage: 'Beobachtungen zugeordnet' })}
        name="observations"
        value={row.observations ?? false}
        onChange={onChange}
        validationState={validations?.observations?.state}
        validationMessage={validations?.observations?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'aB1CdE', defaultMessage: 'Dateien' })}
        name="place_files"
        value={row.place_files ?? false}
        onChange={onChange}
        validationState={validations?.place_files?.state}
        validationMessage={validations?.place_files?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'rP1UsQ', defaultMessage: 'Benutzer in Ort anzeigen' })}
        name="place_users_in_place"
        value={row.place_users_in_place ?? true}
        onChange={onChange}
        validationState={validations?.place_users_in_place?.state}
        validationMessage={validations?.place_users_in_place?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'wQ9LmN', defaultMessage: 'Dateien in Ort anzeigen' })}
        name="place_files_in_place"
        value={row.place_files_in_place ?? true}
        onChange={onChange}
        validationState={validations?.place_files_in_place?.state}
        validationMessage={validations?.place_files_in_place?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'sK0PjF', defaultMessage: 'Kontrollen' })}
        name="checks"
        value={row.checks ?? false}
        onChange={onChange}
        validationState={validations?.checks?.state}
        validationMessage={validations?.checks?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'tL1QkG', defaultMessage: 'Kontroll-Mengen' })}
        name="check_quantities"
        value={row.check_quantities ?? false}
        onChange={onChange}
        validationState={validations?.check_quantities?.state}
        validationMessage={validations?.check_quantities?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'dR0VsL', defaultMessage: 'Kontroll-Mengen in Kontrolle anzeigen' })}
        name="check_quantities_in_check"
        value={row.check_quantities_in_check ?? true}
        onChange={onChange}
        validationState={validations?.check_quantities_in_check?.state}
        validationMessage={validations?.check_quantities_in_check?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'uM2RlH', defaultMessage: 'Taxa' })}
        name="check_taxa"
        value={row.check_taxa ?? false}
        onChange={onChange}
        validationState={validations?.check_taxa?.state}
        validationMessage={validations?.check_taxa?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'gE4ItL', defaultMessage: 'Taxa in Kontrolle anzeigen' })}
        name="check_taxa_in_check"
        value={row.check_taxa_in_check ?? true}
        onChange={onChange}
        validationState={validations?.check_taxa_in_check?.state}
        validationMessage={validations?.check_taxa_in_check?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'kL3MnO', defaultMessage: 'Dateien' })}
        name="check_files"
        value={row.check_files ?? false}
        onChange={onChange}
        validationState={validations?.check_files?.state}
        validationMessage={validations?.check_files?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'rN5QwT', defaultMessage: 'Dateien in Kontrolle anzeigen' })}
        name="check_files_in_check"
        value={row.check_files_in_check ?? true}
        onChange={onChange}
        validationState={validations?.check_files_in_check?.state}
        validationMessage={validations?.check_files_in_check?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'nF5KeA', defaultMessage: 'Berichte' })}
        name="check_reports"
        value={row.check_reports ?? false}
        onChange={onChange}
        validationState={validations?.check_reports?.state}
        validationMessage={validations?.check_reports?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'oG6LfB', defaultMessage: 'Bericht-Mengen' })}
        name="check_report_quantities"
        value={row.check_report_quantities ?? false}
        onChange={onChange}
        validationState={validations?.check_report_quantities?.state}
        validationMessage={validations?.check_report_quantities?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'qH7MpR4', defaultMessage: 'Bericht-Mengen im Bericht anzeigen' })}
        name="check_report_quantities_in_report"
        value={row.check_report_quantities_in_report ?? true}
        onChange={onChange}
        validationState={validations?.check_report_quantities_in_report?.state}
        validationMessage={validations?.check_report_quantities_in_report?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'pH7MgC', defaultMessage: 'Massnahmen' })}
        name="actions"
        value={row.actions ?? false}
        onChange={onChange}
        validationState={validations?.actions?.state}
        validationMessage={validations?.actions?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'qI8NhD', defaultMessage: 'Massnahmen-Mengen' })}
        name="action_quantities"
        value={row.action_quantities ?? false}
        onChange={onChange}
        validationState={validations?.action_quantities?.state}
        validationMessage={validations?.action_quantities?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'fD5OsU', defaultMessage: 'Massnahmen-Mengen in Massnahme anzeigen' })}
        name="action_quantities_in_action"
        value={row.action_quantities_in_action ?? true}
        onChange={onChange}
        validationState={validations?.action_quantities_in_action?.state}
        validationMessage={validations?.action_quantities_in_action?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'pQ2RsT', defaultMessage: 'Taxa' })}
        name="action_taxa"
        value={row.action_taxa ?? false}
        onChange={onChange}
        validationState={validations?.action_taxa?.state}
        validationMessage={validations?.action_taxa?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'rS3TuV', defaultMessage: 'Taxa in Massnahme anzeigen' })}
        name="action_taxa_in_action"
        value={row.action_taxa_in_action ?? true}
        onChange={onChange}
        validationState={validations?.action_taxa_in_action?.state}
        validationMessage={validations?.action_taxa_in_action?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'fG2HiJ', defaultMessage: 'Dateien' })}
        name="action_files"
        value={row.action_files ?? false}
        onChange={onChange}
        validationState={validations?.action_files?.state}
        validationMessage={validations?.action_files?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'gH3IjK', defaultMessage: 'Dateien in Massnahme anzeigen' })}
        name="action_files_in_action"
        value={row.action_files_in_action ?? true}
        onChange={onChange}
        validationState={validations?.action_files_in_action?.state}
        validationMessage={validations?.action_files_in_action?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'eV3FxH', defaultMessage: 'Berichte' })}
        name="action_reports"
        value={row.action_reports ?? false}
        onChange={onChange}
        validationState={validations?.action_reports?.state}
        validationMessage={validations?.action_reports?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'fW4GyI', defaultMessage: 'Bericht-Mengen' })}
        name="action_report_quantities"
        value={row.action_report_quantities ?? false}
        onChange={onChange}
        validationState={validations?.action_report_quantities?.state}
        validationMessage={validations?.action_report_quantities?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'gX5HzJ', defaultMessage: 'Bericht-Mengen im Bericht anzeigen' })}
        name="action_report_quantities_in_report"
        value={row.action_report_quantities_in_report ?? true}
        onChange={onChange}
        validationState={validations?.action_report_quantities_in_report?.state}
        validationMessage={validations?.action_report_quantities_in_report?.message}
      />
    </div>
  )

  const visibleCurrentFields = new Set([
    'level',
    'name_singular_de',
    'name_plural_de',
    'name_singular_en',
    'name_plural_en',
    'name_singular_fr',
    'name_plural_fr',
    'name_singular_it',
    'name_plural_it',
    'observations',
    'place_files',
    'place_users_in_place',
    'place_files_in_place',
    'checks',
    'check_quantities',
    'check_quantities_in_check',
    'check_taxa',
    'check_taxa_in_check',
    'check_files',
    'check_files_in_check',
    'check_reports',
    'check_report_quantities',
    'check_report_quantities_in_report',
    'actions',
    'action_quantities',
    'action_quantities_in_action',
    'action_taxa',
    'action_taxa_in_action',
    'action_files',
    'action_files_in_action',
    'action_reports',
    'action_report_quantities',
    'action_report_quantities_in_report',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      level: { id: 'Lv9nRx', defaultMessage: 'Stufe' },
      name_singular_de: { id: 'bT3YsO', defaultMessage: 'Deutsch: Einzahl' },
      name_plural_de: { id: 'cU4ZtP', defaultMessage: 'Deutsch: Mehrzahl' },
      name_singular_en: { id: 'eW6BvR', defaultMessage: 'Englisch: Einzahl' },
      name_plural_en: { id: 'fX7CwS', defaultMessage: 'Englisch: Mehrzahl' },
      name_singular_fr: { id: 'hZ9EyU', defaultMessage: 'Französisch: Einzahl' },
      name_plural_fr: { id: 'iA0FzV', defaultMessage: 'Französisch: Mehrzahl' },
      name_singular_it: { id: 'kC2HbX', defaultMessage: 'Italienisch: Einzahl' },
      name_plural_it: { id: 'lD3IcY', defaultMessage: 'Italienisch: Mehrzahl' },
      observations: { id: 'vN3SmI', defaultMessage: 'Beobachtungen zugeordnet' },
      place_files: { id: 'aB1CdE', defaultMessage: 'Dateien' },
      place_users_in_place: { id: 'rP1UsQ', defaultMessage: 'Benutzer in Ort anzeigen' },
      place_files_in_place: { id: 'wQ9LmN', defaultMessage: 'Dateien in Ort anzeigen' },
      checks: { id: 'sK0PjF', defaultMessage: 'Kontrollen' },
      check_quantities: { id: 'tL1QkG', defaultMessage: 'Kontroll-Mengen' },
      check_quantities_in_check: { id: 'dR0VsL', defaultMessage: 'Kontroll-Mengen in Kontrolle anzeigen' },
      check_taxa: { id: 'uM2RlH', defaultMessage: 'Taxa' },
      check_taxa_in_check: { id: 'gE4ItL', defaultMessage: 'Taxa in Kontrolle anzeigen' },
      check_files: { id: 'kL3MnO', defaultMessage: 'Dateien' },
      check_files_in_check: { id: 'rN5QwT', defaultMessage: 'Dateien in Kontrolle anzeigen' },
      check_reports: { id: 'nF5KeA', defaultMessage: 'Berichte' },
      check_report_quantities: { id: 'oG6LfB', defaultMessage: 'Bericht-Mengen' },
      check_report_quantities_in_report: { id: 'qH7MpR4', defaultMessage: 'Bericht-Mengen im Bericht anzeigen' },
      actions: { id: 'pH7MgC', defaultMessage: 'Massnahmen' },
      action_quantities: { id: 'qI8NhD', defaultMessage: 'Massnahmen-Mengen' },
      action_quantities_in_action: { id: 'fD5OsU', defaultMessage: 'Massnahmen-Mengen in Massnahme anzeigen' },
      action_taxa: { id: 'pQ2RsT', defaultMessage: 'Taxa' },
      action_taxa_in_action: { id: 'rS3TuV', defaultMessage: 'Taxa in Massnahme anzeigen' },
      action_files: { id: 'fG2HiJ', defaultMessage: 'Dateien' },
      action_files_in_action: { id: 'gH3IjK', defaultMessage: 'Dateien in Massnahme anzeigen' },
      action_reports: { id: 'eV3FxH', defaultMessage: 'Berichte' },
      action_report_quantities: { id: 'fW4GyI', defaultMessage: 'Bericht-Mengen' },
      action_report_quantities_in_report: { id: 'gX5HzJ', defaultMessage: 'Bericht-Mengen im Bericht anzeigen' },
    },
  })

  const formatFieldValue = (field: string, history: PlaceLevelsHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<PlaceLevelsHistory>
      onBack={() => navigate({ to: placeLevelPath })}
      leftContent={leftContent}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'place_levels_history',
        rowIdField: 'place_level_id',
        rowId: placeLevelId,
        historyPath,
        routeHistoryId: placeLevelHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'place_levels',
        rowIdName: 'place_level_id',
        rowId: placeLevelId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
