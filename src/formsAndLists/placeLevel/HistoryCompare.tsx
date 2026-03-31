import { useState, useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { PlaceLevelForm } from './Form.tsx'
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
  const autoFocusRef = useRef<HTMLInputElement>(null)
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
      <PlaceLevelForm
        row={row}
        onChange={onChange}
        validations={validations as Record<string, { state: string; message: string }>}
        autoFocusRef={autoFocusRef}
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
