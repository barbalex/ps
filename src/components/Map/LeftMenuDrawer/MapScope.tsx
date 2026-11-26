import { Field, Select } from '@fluentui/react-components'
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
import { subprojectNameSingularExpr } from '../../../modules/subprojectNameCols.ts'
import styles from './Content.module.css'

type Choice = { id: string; label: string }

export const MapScope = () => {
  const { projectId, subprojectId } = useOwnLayerScope()
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const userId = useAtomValue(userIdAtom)
  const language = useAtomValue(languageAtom)
  const creating = useAtomValue(mapCreationAtom)
  const drawing = useAtomValue(drawingOnMapAtom)
  const clearInfo = useSetAtom(mapInfoAtom)
  const projects =
    useLiveQuery<Choice & { subproject_label: string | null }>(
      `SELECT project_id AS id, coalesce(nullif(label,''), nullif(name,''), project_id::text) AS label,
       ${subprojectNameSingularExpr(language)} AS subproject_label
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
                search: { layers: undefined, mapOverview: undefined },
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
      {project && (
        <SubprojectScope
          key={project.id}
          projectId={project.id}
          subprojectId={subprojectId}
          label={
            project.subproject_label ||
            formatMessage({ id: 'gxCh0c', defaultMessage: 'Teilprojekt' })
          }
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
  const subprojects =
    useLiveQuery<Choice>(
      `SELECT subproject_id AS id, label FROM subprojects WHERE project_id=$1
       AND subproject_id IN (SELECT subproject_id FROM subproject_roles
         WHERE project_user_id IN (SELECT project_user_id FROM user_project_user_ids($2)))
     ORDER BY label, id`,
      [projectId, userId],
    )?.rows ?? []
  if (subprojects.length < 2) return null
  return (
    <Field
      className={styles.scopeField}
      label={label}
    >
      <Select
        disabled={disabled}
        value={subprojectId ?? ''}
        onChange={(_, { value }) => {
          clearInfo(null)
          if (value)
            void navigate({
              to: '/data/projects/$projectId/subprojects/$subprojectId',
              params: { projectId, subprojectId: value },
              search: { mapOverview: undefined },
            })
          else
            void navigate({
              to: '/data/projects/$projectId',
              params: { projectId },
              search: { mapOverview: undefined },
            })
        }}
      >
        <option value="">{formatMessage({ id: 'mapAllAccessible', defaultMessage: 'Alle zugänglichen' })}</option>
        {subprojects.map((s) => (
          <option
            key={s.id}
            value={s.id}
          >
            {s.label}
          </option>
        ))}
      </Select>
    </Field>
  )
}
