import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { PrintRegular } from '@fluentui/react-icons'
import { MdDesignServices, MdEdit } from 'react-icons/md'

import { createFormDesign } from '../../../modules/createRows.ts'
import type { FormDesignRow } from './useFormDesignRow.ts'
import {
  addOperationAtom,
  addNotificationAtom,
  userIdAtom,
} from '../../../store.ts'
import styles from './FormDesign.module.css'

const { Button, ToggleButton, Tooltip } = fluentUiReactComponents

/**
 * The design controls shown at the top of a form while the project is in
 * editing mode: create/edit the form design and toggle between the
 * auto-generated and the designed form (project-wide). Also carries the
 * print button of the designed form (visible without editing mode).
 */
export const FormDesignToolbar = ({
  designRow,
  table,
  tableViewId,
  designing,
}: {
  designRow?: FormDesignRow
  table: string
  tableViewId?: string
  designing: boolean
}) => {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()
  const currentSearch = useSearch({ strict: false }) as Record<string, unknown>
  const userId = useAtomValue(userIdAtom)
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const { formatMessage } = useIntl()

  const resultProject = useLiveQuery(
    `
      SELECT pr.role
      FROM project_roles pr
      JOIN project_users pu ON pu.project_user_id = pr.project_user_id
      WHERE pr.project_id = $1
        AND (pu.auth_user_id = $2 OR pu.email = (SELECT email FROM users WHERE user_id = $2))
    `,
    [projectId, userId],
  )
  const userRole = resultProject?.rows?.[0]?.role
  const userMayDesign = userRole === 'design' || userRole === 'own'

  const openEditor = () =>
    navigate({ search: { ...currentSearch, formDesign: '1' } as never })

  const startDesigning = async () => {
    if (!projectId) return
    try {
      await createFormDesign({
        projectId,
        tableName: table,
        tableViewId,
      })
    } catch (error) {
      addNotification({
        intent: 'error',
        title: formatMessage({
          id: 'bFwXyQ',
          defaultMessage: 'Formular-Design konnte nicht erstellt werden',
        }),
        body: error instanceof Error ? error.message : String(error),
      })
      return
    }
    openEditor()
  }

  const onToggleActive = async () => {
    if (!designRow) return
    const value = !designRow.active
    const prevRes = await db.query(
      `SELECT * FROM form_designs WHERE form_design_id = $1`,
      [designRow.form_design_id],
    )
    const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
    try {
      await db.query(
        `UPDATE form_designs SET active = $1 WHERE form_design_id = $2`,
        [value, designRow.form_design_id],
      )
    } catch (error) {
      addNotification({
        intent: 'error',
        title: formatMessage({
          id: 'bFxYzR',
          defaultMessage: 'Formular-Design konnte nicht gespeichert werden',
        }),
        body: error instanceof Error ? error.message : String(error),
      })
      return
    }
    addOperation({
      table: 'form_designs',
      rowIdName: 'form_design_id',
      rowId: designRow.form_design_id,
      operation: 'update',
      draft: { active: value },
      prev,
    })
  }

  const openPrint = () =>
    navigate({ search: { ...currentSearch, formPrint: '1' } as never })

  return (
    <div className={`${styles.toolbar} print-hide`}>
      {userMayDesign && designing ?
        designRow ?
          <>
            <Tooltip
              content={formatMessage({
                id: 'bFsTuM',
                defaultMessage:
                  'Zwischen automatisch generiertem und eigenem Formular wechseln (für alle)',
              })}
              relationship="label"
            >
              <ToggleButton
                checked={designRow.active}
                onClick={onToggleActive}
              >
                {formatMessage({
                  id: 'bFtUvN',
                  defaultMessage: 'Eigenes Formular',
                })}
              </ToggleButton>
            </Tooltip>
            <Tooltip
              content={formatMessage({
                id: 'bFuVwO',
                defaultMessage: 'Formular gestalten',
              })}
              relationship="label"
            >
              <Button
                size="medium"
                icon={<MdEdit />}
                onClick={openEditor}
              />
            </Tooltip>
          </>
        : <Button
            size="medium"
            icon={<MdDesignServices />}
            onClick={startDesigning}
          >
            {formatMessage({
              id: 'bFuVwO',
              defaultMessage: 'Formular gestalten',
            })}
          </Button>

      : null}
      {designRow?.active && (
        <Tooltip
          content={formatMessage({
            id: 'bFvWxP',
            defaultMessage: 'Formular drucken',
          })}
          relationship="label"
        >
          <Button
            size="medium"
            icon={<PrintRegular />}
            onClick={openPrint}
          />
        </Tooltip>
      )}
    </div>
  )
}
