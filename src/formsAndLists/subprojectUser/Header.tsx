import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { MdMenuBook } from 'react-icons/md'

const { Button } = fluentUiReactComponents

import { AddProjectUserButton } from '../../components/shared/AddProjectUserButton.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { languageAtom } from '../../store.ts'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'
import { subprojectNameSingularExpr } from '../../modules/subprojectNameCols.ts'

export const Header = ({ autoFocusRef }: { autoFocusRef?: React.RefObject<HTMLInputElement | null> }) => {
  const { projectId, subprojectId, subprojectUserId } = useParams({ strict: false })
  const navigate = useNavigate()
  const requestDelete = useRequestRowDelete()
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)

  const projectRes = useLiveQuery(
    `SELECT ${subprojectNameSingularExpr(language)} AS subproject_name_singular FROM projects WHERE project_id = '${projectId}'`,
  )
  const subprojectNameSingular = projectRes?.rows?.[0]?.subproject_name_singular
  const title = subprojectNameSingular
    ? `${subprojectNameSingular}-${formatMessage({ id: 'qyI8KV', defaultMessage: 'Benutzer' })}`
    : formatMessage({ id: '1M9eWP', defaultMessage: 'Teilprojekt-Benutzer' })
  const basePath = `/data/projects/${projectId}/subprojects/${subprojectId}/users/${subprojectUserId}`

  const db = usePGlite()

  // Keep a ref to the current subprojectUserId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const subprojectUserIdRef = useRef(subprojectUserId)
  useEffect(() => {
    subprojectUserIdRef.current = subprojectUserId
  }, [subprojectUserId])

  const deleteRow = () =>
    requestDelete({
      table: 'subproject_roles',
      rowIdName: 'subproject_role_id',
      rowId: subprojectUserId!,
      navigateTo: '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_role_id FROM subproject_roles WHERE subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const rows = res?.rows as { subproject_role_id: string }[]
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.subproject_role_id === subprojectUserIdRef.current,
      )
      const next = rows[(index + 1) % len]
      navigate({
        to: `../${next.subproject_role_id}`,
        params: (prev) => ({
          ...prev,
          subprojectUserId: next.subproject_role_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next subproject user:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_role_id FROM subproject_roles WHERE subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const rows = res?.rows as { subproject_role_id: string }[]
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.subproject_role_id === subprojectUserIdRef.current,
      )
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `../${previous.subproject_role_id}`,
        params: (prev) => ({
          ...prev,
          subprojectUserId: previous.subproject_role_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous subproject user:', error)
    }
  }

  const openDocs = () =>
    window.open('/docs/user-roles', '_blank', 'noreferrer')

  return (
    <FormHeader
      title={title}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="subproject user"
      siblings={
        <>
          <AddProjectUserButton
            scope={{
              kind: 'subproject',
              projectId: projectId!,              subprojectId: subprojectId!,            }}
            onUserCreated={(id) => {
              navigate({ to: `../${id}` })
              autoFocusRef?.current?.focus()
            }}
          />
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={basePath}
            historyTable="subproject_roles_history"
            rowIdField="subproject_role_id"
            rowId={subprojectUserId}
          />
          <Button
            icon={<MdMenuBook />}
            title={formatMessage({
              id: 'user.openDocs',
              defaultMessage: 'Dokumentation öffnen',
            })}
            onClick={openDocs}
          />
        </>
      }
    />
  )
}
