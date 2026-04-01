import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { Configuration } from './index.tsx'
import { HistoryCompare } from '../../../components/shared/HistoryCompare/index.tsx'
import {
  createHistoryFieldLabelFormatter,
  stringifyHistoryValue,
} from '../../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../../components/shared/Loading.tsx'
import { NotFound } from '../../../components/NotFound.tsx'
import { addOperationAtom } from '../../../store.ts'
import { projectTypeOptions } from '../../../modules/constants.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type ProjectsHistory from '../../../models/public/ProjectsHistory.ts'

const from =
  '/data/projects/$projectId_/configuration/histories/$projectConfigurationHistoryId'

const configFrom = '/data/projects/$projectId_/configuration'

export const ProjectConfigurationHistoryCompare = () => {
  const { formatMessage, locale } = useIntl()
  const navigate = useNavigate()
  const { projectId, projectConfigurationHistoryId } = useParams({
    from,
    strict: false,
  })

  const formPath = `/data/projects/${projectId}/configuration`
  const historyPath = `${formPath}/histories`

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const rowRes = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const row = rowRes?.rows?.[0] as Record<string, unknown> | undefined

  const unitsRes = useLiveQuery(
    `SELECT unit_id, name FROM units WHERE project_id = $1 ORDER BY sort, name`,
    [projectId],
  )
  const unitLabelMap = Object.fromEntries(
    (unitsRes?.rows ?? []).map((u) => [u.unit_id, u.name ?? u.unit_id]),
  )

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'fz2AhZ', defaultMessage: 'Projekt' })}
        id={projectId}
      />
    )
  }

  const leftContent = <Configuration from={configFrom} />

  const lang = locale.split('-')[0]
  const subprojectName =
    (row?.[`subproject_name_plural_${lang}`] as string | undefined) ??
    (row?.subproject_name_plural as string | undefined) ??
    formatMessage({ id: 'subprojectPluralFallback', defaultMessage: 'Arten' })
  const subprojectNameSingular =
    (row?.[`subproject_name_singular_${lang}`] as string | undefined) ??
    (row?.subproject_name_singular as string | undefined) ??
    formatMessage({ id: 'subprojectSingularFallback', defaultMessage: 'Teilprojekt' })

  const baseFormatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      type: { id: 'xTeBn/', defaultMessage: 'Typ' },
      subproject_name_singular: {
        id: 'bT3YsO',
        defaultMessage: 'Deutsch: Einzahl',
      },
      subproject_name_plural: {
        id: 'cU4ZtP',
        defaultMessage: 'Deutsch: Mehrzahl',
      },
      subproject_name_singular_en: {
        id: 'eW6BvR',
        defaultMessage: 'Englisch: Einzahl',
      },
      subproject_name_plural_en: {
        id: 'fX7CwS',
        defaultMessage: 'Englisch: Mehrzahl',
      },
      subproject_name_singular_fr: {
        id: 'hZ9EyU',
        defaultMessage: 'Französisch: Einzahl',
      },
      subproject_name_plural_fr: {
        id: 'iA0FzV',
        defaultMessage: 'Französisch: Mehrzahl',
      },
      subproject_name_singular_it: {
        id: 'kC2HbX',
        defaultMessage: 'Italienisch: Einzahl',
      },
      subproject_name_plural_it: {
        id: 'lD3IcY',
        defaultMessage: 'Italienisch: Mehrzahl',
      },
      checks_default_unit_id: {
        id: 'qB8CdE',
        defaultMessage: 'Standard-Einheit für Kontroll-Mengen',
      },
      check_taxa_default_unit_id: {
        id: 'mP7QrS',
        defaultMessage: 'Standard-Einheit für Kontroll-Taxon-Mengen',
      },
      check_reports_default_unit_id: {
        id: 'cU1DvF',
        defaultMessage: 'Standard-Einheit für Kontroll-Bericht-Mengen',
      },
      actions_default_unit_id: {
        id: 'nR6StU',
        defaultMessage: 'Standard-Einheit für Massnahmen-Mengen',
      },
      action_taxa_default_unit_id: {
        id: 'bT0CsE',
        defaultMessage: 'Standard-Einheit für Massnahmen-Taxon-Mengen',
      },
      action_reports_default_unit_id: {
        id: 'dV2EwG',
        defaultMessage: 'Standard-Einheit für Massnahmen-Bericht-Mengen',
      },
      values_on_multiple_levels: {
        id: 'jA4BeC',
        defaultMessage: '...Werte auf mehreren Ort-Stufen',
      },
      multiple_check_quantities_on_same_level: {
        id: 'lH6IjK',
        defaultMessage: '...mehrere Kontroll-Mengen auf gleicher Ort-Stufe',
      },
      multiple_action_quantities_on_same_level: {
        id: 'mI7JkL',
        defaultMessage: '...mehrere Massnahmen-Mengen auf gleicher Ort-Stufe',
      },
      enable_histories: {
        id: 'bHistProjSetting',
        defaultMessage: 'Geschichte vergleichen',
      },
      project_reports: {
        id: 'CiJ0SG',
        defaultMessage: 'Berichte',
      },
      wms_layers: {
        id: 'tV2WxY',
        defaultMessage: 'WMS-Dienste und WMS-Ebenen',
      },
      vector_layers: {
        id: 'vX4YzA',
        defaultMessage: 'WFS-Dienste und Vektor-Ebenen',
      },
      files_active_projects: {
        id: 'aB1CdE',
        defaultMessage: 'Dateien',
      },
      project_files_in_project: {
        id: 'qP7PrjFileInPrj',
        defaultMessage: 'Dateien im Projekt anzeigen',
      },
      project_users_in_project: {
        id: 'mQ4PrjUsersInPrj',
        defaultMessage: 'Benutzer im Projekt anzeigen',
      },
      project_reports_in_project: {
        id: 'prjRptsInPrj',
        defaultMessage: 'Berichte im Projekt anzeigen',
      },
      units_in_project: {
        id: 'uN9UntInPrj',
        defaultMessage: 'Einheiten im Projekt anzeigen',
      },
      fields_in_project: {
        id: 'pR8FldInPrj',
        defaultMessage: 'Felder im Projekt anzeigen',
      },
      list_values_in_list: {
        id: 'lV6LstValsInLst',
        defaultMessage: 'Listen-Werte in Liste anzeigen',
      },
      vlds_in_vector_layer: {
        id: 'vldsInVL',
        defaultMessage: 'Vektor-Ebene-Anzeigen in Vektor-Ebene anzeigen',
      },
      subproject_reports: {
        id: 'subprojectReports',
        defaultMessage: '{subprojectNameSingular}-Berichte',
        values: { subprojectNameSingular },
      },
      subproject_reports_in_subproject: {
        id: 'sPRinSP',
        defaultMessage:
          '{subprojectNameSingular}-Berichte in {subprojectNameSingular} anzeigen',
        values: { subprojectNameSingular },
      },
      goals: {
        id: '3srcwg',
        defaultMessage: 'Ziele',
      },
      goal_reports_in_goal: {
        id: 'gRinGoal',
        defaultMessage: 'Ziel-Berichte im Ziel anzeigen',
      },
      occurrences: {
        id: 'yK5Pq6',
        defaultMessage: 'Beobachtungen (inkl. Importe)',
      },
      taxa: {
        id: '7sVbg1',
        defaultMessage: 'Taxa',
      },
      subproject_taxa_in_subproject: {
        id: 'sP8TaxInSubprj',
        defaultMessage: 'Taxa in {subprojectNameSingular} anzeigen',
        values: { subprojectNameSingular },
      },
      charts: {
        id: 'ZPEO8P',
        defaultMessage: 'Diagramme',
      },
      subproject_users_in_subproject: {
        id: 'N3qLx9',
        defaultMessage: 'Benutzer in {subprojectNameSingular} anzeigen',
        values: { subprojectNameSingular },
      },
      files_active_subprojects: {
        id: 'aB1CdE',
        defaultMessage: 'Dateien',
      },
      subproject_files_in_subproject: {
        id: 'fH8JmQ',
        defaultMessage: 'Dateien in {subprojectNameSingular} anzeigen',
        values: { subprojectNameSingular },
      },
      subproject_order_by: {
        id: 'cY7ZaB',
        defaultMessage: 'Teilprojekt sortieren nach (Feldname)',
      },
      goal_reports_label_by: {
        id: 'dC8DeF',
        defaultMessage: 'Berichte beschriften nach',
      },
      places_label_by: {
        id: 'eG9HiJ',
        defaultMessage: 'Orte beschriften nach',
      },
      places_order_by: {
        id: 'fK0LmN',
        defaultMessage: 'Orte sortieren nach',
      },
      map_presentation_crs: {
        id: 'gO1PqR',
        defaultMessage: 'Karten-Präsentations-KBS',
      },
      files_offline: {
        id: 'mL7MnO',
        defaultMessage: 'Dateien lokal speichern (offline verfügbar)',
      },
    },
  })

  const formatFieldLabel = baseFormatFieldLabel

  const projectTypeLabelMap = Object.fromEntries(
    projectTypeOptions.map(({ value, labelId, defaultMessage }) => [
      value,
      formatMessage({ id: labelId, defaultMessage }),
    ]),
  )

  const unitIdFields = new Set([
    'checks_default_unit_id',
    'check_taxa_default_unit_id',
    'check_reports_default_unit_id',
    'actions_default_unit_id',
    'action_taxa_default_unit_id',
    'action_reports_default_unit_id',
  ])

  const formatFieldValue = (field: string, history: ProjectsHistory) => {
    if (field === 'type') {
      const value = history[field]
      if (typeof value === 'string') {
        return projectTypeLabelMap[value] ?? value
      }
    }
    if (unitIdFields.has(field)) {
      const value = history[field]
      if (typeof value === 'string') {
        return unitLabelMap[value] ?? value
      }
    }
    return stringifyHistoryValue(history[field])
  }

  return (
    <HistoryCompare<ProjectsHistory>
      onBack={() => navigate({ to: formPath })}
      leftContent={leftContent}
      visibleCurrentFields={new Set(preferredOrder)}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'projects_history',
        rowIdField: 'project_id',
        rowId: projectId,
        historyPath,
        routeHistoryId: projectConfigurationHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'projects',
        rowIdName: 'project_id',
        rowId: projectId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
