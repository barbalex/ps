import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { createSubprojectQc } from '../modules/createRows.ts'
import { CheckboxField } from '../components/shared/CheckboxField.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { addOperationAtom, languageAtom } from '../store.ts'
import { subprojectNamePluralExpr } from '../modules/subprojectNameCols.ts'
import { getPlaceFallbackNames } from '../modules/placeNameFallback.ts'
import { projectTypeNames } from '../modules/projectTypeNames.ts'

import '../form.css'

const { Button, Input, Field } = fluentUiReactComponents

type QcRow = {
  qcs_id: string
  name: string | null
  label: string | null
  table_name: string | null
  place_level: number | null
  sort: number | null
}

type ActiveEntry = {
  qcs_assignment_id: string
  qc_id: string
}

type Group = {
  id: string
  table_name: string | null
  place_level: number | null
  groupLabel: string
}

export const SubprojectQcs = ({ from }) => {
  const { projectId, subprojectId } = useParams({ from })
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  const [searchTerm, setSearchTerm] = useState('')

  // Load project info for subproject label
  const projectRes = useLiveQuery(
    `SELECT ${subprojectNamePluralExpr(language)} AS name_plural, type FROM projects WHERE project_id = $1`,
    [projectId],
  )

  // Load place levels for dynamic group names
  const placeLevelsRes = useLiveQuery(
    `SELECT level,
      COALESCE(NULLIF(name_singular_${language}, ''), name_singular_de) AS name_singular,
      COALESCE(NULLIF(name_plural_${language}, ''), name_plural_de) AS name_plural
    FROM place_levels WHERE project_id = $1 ORDER BY level`,
    [projectId],
  )

  // Load all qcs
  const qcsRes = useLiveQuery(
    `SELECT qcs_id, name, COALESCE(NULLIF(label_${language}, ''), label_de) AS label, table_name, place_level, sort FROM qcs WHERE is_subproject_level = true ORDER BY label`,
  )

  // Load active qcs_assignment for this subproject
  const activeRes = useLiveQuery(
    `SELECT qcs_assignment_id, qc_id FROM qcs_assignment WHERE subproject_id = $1`,
    [subprojectId],
  )

  const loading =
    projectRes === undefined ||
    placeLevelsRes === undefined ||
    qcsRes === undefined ||
    activeRes === undefined

  if (loading) return <Loading />

  const projectType = projectRes?.rows[0]?.type ?? 'species'
  const subprojectsLabel =
    (projectRes?.rows[0]?.name_plural as string | null | undefined) ??
    projectTypeNames[projectType]?.subproject_name_plural ??
    formatMessage({ id: 'bEaAfF', defaultMessage: 'Teilprojekte' })

  const level1Row = placeLevelsRes?.rows?.find((r) => r.level === 1)
  const level2Row = placeLevelsRes?.rows?.find((r) => r.level === 2)
  const fallback1 = getPlaceFallbackNames(projectType, 1, formatMessage)
  const fallback2 = getPlaceFallbackNames(projectType, 2, formatMessage)

  const plural1 =
    (level1Row?.name_plural as string | null | undefined) ?? fallback1.plural
  const singular1 =
    (level1Row?.name_singular as string | null | undefined) ??
    fallback1.singular
  const plural2 =
    (level2Row?.name_plural as string | null | undefined) ?? fallback2.plural
  const singular2 =
    (level2Row?.name_singular as string | null | undefined) ??
    fallback2.singular

  // Group definitions in chart-subjects sort order
  const groups: Group[] = [
    {
      id: 'subprojects',
      table_name: 'subprojects',
      place_level: null,
      groupLabel: subprojectsLabel,
    },
    {
      id: 'places_1',
      table_name: 'places',
      place_level: 1,
      groupLabel: plural1,
    },
    {
      id: 'checks_1',
      table_name: 'checks',
      place_level: 1,
      groupLabel: formatMessage(
        { id: 'bEgGlL', defaultMessage: '{place}-Kontrollen' },
        { place: singular1 },
      ),
    },
    {
      id: 'check_quantities_1',
      table_name: 'check_quantities',
      place_level: 1,
      groupLabel: formatMessage(
        { id: 'bEhHmM', defaultMessage: '{place}-Kontroll-Mengen' },
        { place: singular1 },
      ),
    },
    {
      id: 'actions_1',
      table_name: 'actions',
      place_level: 1,
      groupLabel: formatMessage(
        { id: 'bEiInN', defaultMessage: '{place}-Massnahmen' },
        { place: singular1 },
      ),
    },
    {
      id: 'action_quantities_1',
      table_name: 'action_quantities',
      place_level: 1,
      groupLabel: formatMessage(
        { id: 'bEjJoO', defaultMessage: '{place}-Massnahmen-Mengen' },
        { place: singular1 },
      ),
    },
    {
      id: 'places_2',
      table_name: 'places',
      place_level: 2,
      groupLabel: plural2,
    },
    {
      id: 'checks_2',
      table_name: 'checks',
      place_level: 2,
      groupLabel: formatMessage(
        { id: 'bEgGlL', defaultMessage: '{place}-Kontrollen' },
        { place: singular2 },
      ),
    },
    {
      id: 'check_quantities_2',
      table_name: 'check_quantities',
      place_level: 2,
      groupLabel: formatMessage(
        { id: 'bEhHmM', defaultMessage: '{place}-Kontroll-Mengen' },
        { place: singular2 },
      ),
    },
    {
      id: 'actions_2',
      table_name: 'actions',
      place_level: 2,
      groupLabel: formatMessage(
        { id: 'bEiInN', defaultMessage: '{place}-Massnahmen' },
        { place: singular2 },
      ),
    },
    {
      id: 'action_quantities_2',
      table_name: 'action_quantities',
      place_level: 2,
      groupLabel: formatMessage(
        { id: 'bEjJoO', defaultMessage: '{place}-Massnahmen-Mengen' },
        { place: singular2 },
      ),
    },
  ]

  const allQcs: QcRow[] = qcsRes?.rows ?? []
  const activeEntries: ActiveEntry[] = activeRes?.rows ?? []
  const activeQcIds = new Set(activeEntries.map((r) => r.qc_id))

  // Apply search filter
  const filteredQcs = searchTerm.trim()
    ? allQcs.filter((qc) => {
        const term = searchTerm.toLowerCase()
        return (
          (qc.label ?? '').toLowerCase().includes(term) ||
          (qc.name ?? '').toLowerCase().includes(term)
        )
      })
    : allQcs

  // Sort qcs within a group: sort → name → id
  const sortQcs = (qcs: QcRow[]) =>
    [...qcs].sort((a, b) => {
      const sa = a.sort != null ? String(a.sort) : ''
      const sb = b.sort != null ? String(b.sort) : ''
      if (sa !== sb) return sa.localeCompare(sb, undefined, { numeric: true })
      const na = a.name ?? a.qcs_id
      const nb = b.name ?? b.qcs_id
      return na.localeCompare(nb)
    })

  // Build groups with matching qcs
  const populatedGroups = groups
    .map((group) => ({
      ...group,
      qcs: sortQcs(
        filteredQcs.filter(
          (qc) =>
            qc.table_name === group.table_name &&
            qc.place_level === group.place_level,
        ),
      ),
    }))
    .filter((g) => g.qcs.length > 0)

  // Also handle qcs without a table_name or with unknown table_name (show at end)
  const knownTableNames = new Set(groups.map((g) => g.table_name))
  const ungroupedQcs = sortQcs(
    filteredQcs.filter(
      (qc) => qc.table_name === null || !knownTableNames.has(qc.table_name),
    ),
  )

  const toggle = async (qcId: string) => {
    if (activeQcIds.has(qcId)) {
      const entry = activeEntries.find((e) => e.qc_id === qcId)
      if (!entry) return
      try {
        await db.query(
          `DELETE FROM qcs_assignment WHERE qcs_assignment_id = $1`,
          [entry.qcs_assignment_id],
        )
        addOperation({
          table: 'qcs_assignment',
          rowIdName: 'qcs_assignment_id',
          rowId: entry.qcs_assignment_id,
          operation: 'delete',
          prev: {
            qcs_assignment_id: entry.qcs_assignment_id,
            qc_id: qcId,
            subproject_id: subprojectId,
          },
        })
      } catch (error) {
        console.error('Error removing subproject QC:', error)
      }
    } else {
      await createSubprojectQc({ subprojectId, qcId })
    }
  }

  const activateAll = async () => {
    const inactiveQcs = filteredQcs.filter((qc) => !activeQcIds.has(qc.qcs_id))
    for (const qc of inactiveQcs) {
      await createSubprojectQc({ subprojectId, qcId: qc.qcs_id })
    }
  }

  const deactivateAll = async () => {
    const toDelete = activeEntries.filter((e) =>
      filteredQcs.some((qc) => qc.qcs_id === e.qc_id),
    )
    for (const entry of toDelete) {
      try {
        await db.query(
          `DELETE FROM qcs_assignment WHERE qcs_assignment_id = $1`,
          [entry.qcs_assignment_id],
        )
        addOperation({
          table: 'qcs_assignment',
          rowIdName: 'qcs_assignment_id',
          rowId: entry.qcs_assignment_id,
          operation: 'delete',
          prev: {
            qcs_assignment_id: entry.qcs_assignment_id,
            qc_id: entry.qc_id,
            subproject_id: subprojectId,
          },
        })
      } catch (error) {
        console.error('Error removing subproject QC:', error)
      }
    }
  }

  const title = formatMessage({
    id: 'subprojectQcs.title',
    defaultMessage: 'Qualitätskontrollen wählen',
  })

  console.log('SubprojectQcs, populatedGroups:', populatedGroups)
  console.log('SubprojectQcs, ungroupedQcs:', ungroupedQcs)

  return (
    <div className="list-view">
      <div className="list-view-header">
        <h1>{title}</h1>
      </div>
      <div
        style={{
          padding: '8px 10px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <Field
          label={formatMessage({
            id: 'subprojectQcs.filter',
            defaultMessage: 'Filtern',
          })}
        >
          <Input
            value={searchTerm}
            onChange={(_, data) => setSearchTerm(data.value)}
            placeholder={formatMessage({
              id: 'subprojectQcs.filterPlaceholder',
              defaultMessage: 'Name...',
            })}
            appearance="underline"
          />
        </Field>
        <Button appearance="subtle" onClick={activateAll}>
          {formatMessage({
            id: 'subprojectQcs.activateAll',
            defaultMessage: 'Alle aktivieren',
          })}
        </Button>
        <Button appearance="subtle" onClick={deactivateAll}>
          {formatMessage({
            id: 'subprojectQcs.deactivateAll',
            defaultMessage: 'Alle deaktivieren',
          })}
        </Button>
      </div>
      <div className="list-container">
        {populatedGroups.map((group) => (
          <div key={group.id} style={{ marginBottom: '8px' }}>
            <div
              style={{
                padding: '4px 10px',
                fontWeight: 600,
                fontSize: '0.85em',
                color: 'var(--colorNeutralForeground3, #666)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {group.groupLabel}
            </div>
            {group.qcs.map((qc) => (
              <CheckboxField
                key={qc.qcs_id}
                label={qc.label ?? qc.qcs_id}
                name={qc.qcs_id}
                value={activeQcIds.has(qc.qcs_id)}
                onChange={() => toggle(qc.qcs_id)}
              />
            ))}
          </div>
        ))}
        {ungroupedQcs.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <div
              style={{
                padding: '4px 10px',
                fontWeight: 600,
                fontSize: '0.85em',
                color: 'var(--colorNeutralForeground3, #666)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {formatMessage({
                id: 'subprojectQcs.otherGroup',
                defaultMessage: 'Sonstige',
              })}
            </div>
            {ungroupedQcs.map((qc) => (
              <CheckboxField
                key={qc.qcs_id}
                label={qc.label ?? qc.qcs_id}
                name={qc.qcs_id}
                value={activeQcIds.has(qc.qcs_id)}
                onChange={() => toggle(qc.qcs_id)}
              />
            ))}
          </div>
        )}
        {populatedGroups.length === 0 && ungroupedQcs.length === 0 && (
          <div style={{ padding: '10px' }}>
            {formatMessage({
              id: 'subprojectQcs.empty',
              defaultMessage: 'Keine Qualitätskontrollen vorhanden',
            })}
          </div>
        )}
      </div>
    </div>
  )
}
