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
  const { formatMessage } = useIntl()
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

  const formatFieldLabel = createHistoryFieldLabelFormatter({
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
    },
  })

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
