import { Combobox, Field, Option, Select } from '@fluentui/react-components'
import { useState } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useNavigate } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import {
  drawingOnMapAtom,
  languageAtom,
  mapInfoAtom,
  userIdAtom,
} from '../../../store.ts'
import { mapCreationAtom } from '../../../modules/mapCreation.ts'
import { useOwnLayerScope } from '../../../modules/useOwnLayerScope.ts'
import { subprojectNamePluralExpr } from '../../../modules/subprojectNameCols.ts'
import { ProjectAreaFilter } from '../../shared/ProjectAreaFilter.tsx'
import { useUrlFilter, filterUrlKey } from '../../../modules/useUrlFilter.ts'
import { filterStringFromFilter } from '../../../modules/filterStringFromFilter.ts'
import { validate as isUuid } from 'uuid'
import styles from './Content.module.css'

type Choice = { id: string; label: string }
const key = filterUrlKey('subprojects')
const exactChoice = (rule: Record<string, unknown>) =>
  Object.keys(rule).length === 1 &&
  typeof rule.subproject_id === 'string' &&
  isUuid(rule.subproject_id)

export const MapScope = () => {
  const { projectId, subprojectId } = useOwnLayerScope()
  const navigate = useNavigate()
  const [filter] = useUrlFilter('subprojects')
  const { formatMessage } = useIntl()
  const userId = useAtomValue(userIdAtom)
  const language = useAtomValue(languageAtom)
  const creating = useAtomValue(mapCreationAtom)
  const drawing = useAtomValue(drawingOnMapAtom)
  const clearInfo = useSetAtom(mapInfoAtom)
  const projects =
    useLiveQuery<Choice & { subproject_label: string | null }>(
      `SELECT project_id AS id, coalesce(nullif(label,''), nullif(name,''), project_id::text) AS label,
       ${subprojectNamePluralExpr(language)} AS subproject_label
     FROM projects WHERE project_id IN (
       SELECT project_id FROM project_roles WHERE project_user_id IN (SELECT project_user_id FROM user_project_user_ids($1))
     ) ORDER BY label, id`,
      [userId],
    )?.rows ?? []
  const project =
    projects.find((p) => p.id === projectId) ??
    (!projectId && projects.length === 1 ? projects[0] : undefined)
  return (
    <>
      {(projects.length > 1 || (!projectId && projects.length === 1)) && (
        <Field
          className={styles.scopeField}
          label={formatMessage({ id: 'fz2AhZ', defaultMessage: 'Projekt' })}
        >
          <Select
            value={projectId ?? ''}
            disabled={drawing || !!creating}
            onChange={(_, { value }) => {
              clearInfo(null)
              void navigate({
                to: '/data/projects/$projectId',
                params: { projectId: value },
                search: {
                  layers: undefined,
                  mapOverview: undefined,
                  ...(filter.every(exactChoice) && { [key]: undefined }),
                },
              })
            }}
          >
            <option
              value=""
              disabled
            >
              —
            </option>
            {projects.map((p) => (
              <option
                key={p.id}
                value={p.id}
              >
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {projectId && <ProjectAreaFilter projectId={projectId} className={styles.scopeField} />}
      {project && (
        <SubprojectScope
          key={project.id}
          projectId={project.id}
          subprojectId={subprojectId}
          label={formatMessage(
            { id: 'mapSubprojectFilter', defaultMessage: '{name} Filter' },
            {
              name: project.subproject_label ||
                formatMessage({ id: 'Jou8/E', defaultMessage: 'Teilprojekte' }),
            },
          )}
          userId={userId}
          disabled={drawing || !!creating}
        />
      )}
    </>
  )
}

function SubprojectScope({
  projectId,
  subprojectId,
  label,
  userId,
  disabled,
}: {
  projectId: string
  subprojectId?: string
  label: string
  userId: string | null
  disabled: boolean
}) {
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const clearInfo = useSetAtom(mapInfoAtom)
  const [filter] = useUrlFilter('subprojects')
  const sql = filterStringFromFilter(filter)
  const exactIds =
    filter.every(exactChoice) ?
      new Set(filter.map((rule) => rule.subproject_id))
    : undefined
  const [search, setSearch] = useState<string | null>(null)
  const subprojects =
    useLiveQuery<Choice & { matches: boolean }>(
      `SELECT subproject_id AS id, coalesce(nullif(label,''), nullif(name,''), subproject_id::text) AS label,
       (${exactIds ? 'false' : sql || 'false'}) AS matches FROM subprojects WHERE project_id=$1
       AND subproject_id IN (SELECT subproject_id FROM subproject_roles
         WHERE project_user_id IN (SELECT project_user_id FROM user_project_user_ids($2)))
     ORDER BY label, id`,
      [projectId, userId],
    )?.rows ?? []
  if (subprojects.length < 2 && !sql) return null
  const selected = subprojects.filter((s) =>
    sql ? (exactIds?.has(s.id) ?? s.matches) : s.id === subprojectId,
  )
  const ids = selected.map((s) => s.id)
  const allLabel = formatMessage({
    id: 'mapAllAccessible',
    defaultMessage: 'Alle zugänglichen',
  })
  const apply = (next: string[]) => {
    if (disabled) return
    if (
      !exactIds &&
      !window.confirm(
        formatMessage({
          id: 'mapReplaceSpeciesRules',
          defaultMessage: 'Die Filterregeln durch diese Auswahl ersetzen?',
        }),
      )
    )
      return
    clearInfo(null)
    const search = {
      mapOverview: undefined,
      [key]:
        next.length ?
          next.map((subproject_id) => ({ subproject_id }))
        : undefined,
    }
    if (next.length === 1)
      void navigate({
        to: '/data/projects/$projectId/subprojects/$subprojectId',
        params: { projectId, subprojectId: next[0] },
        search,
      })
    else
      void navigate({
        to: '/data/projects/$projectId',
        params: { projectId },
        search,
      })
  }
  const query = search?.trim().toLocaleLowerCase() ?? ''
  const visible = subprojects.filter((s) => s.label.toLocaleLowerCase().includes(query))
  const noMatches = formatMessage({
    id: 'mapCreateParentNone',
    defaultMessage: 'Keine Treffer',
  })
  const summary = selected.length ? selected.map((s) => s.label).join(', ') : sql ? noMatches : allLabel
  return (
    <Field className={styles.scopeField} label={label}>
      <Combobox
        multiselect
        className={styles.scopeCombo}
        disabled={disabled}
        selectedOptions={!sql && !subprojectId ? ['all'] : ids}
        value={search ?? summary}
        placeholder={summary}
        onOpenChange={(_, { open }) => setSearch(open ? '' : null)}
        onChange={(event) => setSearch(event.target.value)}
        onOptionSelect={(_, { optionValue, selectedOptions }) => {
          if (!optionValue) return
          apply(optionValue === 'all' ? [] : selectedOptions.filter((id) => id !== 'all'))
          setSearch('')
        }}
      >
        {!query && <Option value="all">{allLabel}</Option>}
        {visible.map((s) => (
          <Option key={s.id} value={s.id}>
            {s.label}
          </Option>
        ))}
        {query && !visible.length && <Option disabled>{noMatches}</Option>}
      </Combobox>
    </Field>
  )
}
