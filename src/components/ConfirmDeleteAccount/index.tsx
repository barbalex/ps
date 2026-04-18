import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
} = fluentUiReactComponents
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'

import { confirmDeleteAccountAtom } from '../../store.ts'
import styles from './index.module.css'

export const ConfirmDeleteAccount = () => {
  const { formatMessage } = useIntl()
  const [state, setState] = useAtom(confirmDeleteAccountAtom)
  const db = usePGlite()
  const [projects, setProjects] = useState<{ project_id: string; label: string | null }[]>([])

  useEffect(() => {
    if (!state) {
      setProjects([])
      return
    }
    db.query<{ project_id: string; label: string | null }>(
      `SELECT project_id, label FROM projects WHERE account_id = $1 ORDER BY label`,
      [state.accountId],
    ).then((res) => setProjects(res?.rows ?? []))
  }, [state, db])

  const onCancel = () => setState(null)

  const onConfirm = () => {
    const cb = state?.onConfirm
    setState(null)
    cb?.()
  }

  if (!state) return null

  return (
    <Dialog open={true}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>
            {formatMessage({
              id: 'confirmDeleteAccountTitle',
              defaultMessage: 'Konto wirklich löschen?',
            })}
          </DialogTitle>
          <DialogContent className={styles.content}>
            <p className={styles.warning}>
              {projects.length > 0
                ? formatMessage(
                    {
                      id: 'confirmDeleteAccountWithProjects',
                      defaultMessage:
                        'Das Löschen dieses Kontos löscht unwiderruflich {count, plural, one {das folgende Projekt} other {die folgenden {count} Projekte}} und alle zugehörigen Daten:',
                    },
                    { count: projects.length },
                  )
                : formatMessage({
                    id: 'confirmDeleteAccountNoProjects',
                    defaultMessage:
                      'Dieses Konto hat keine Projekte. Es wird unwiderruflich gelöscht.',
                  })}
            </p>
            {projects.length > 0 && (
              <ul className={styles.projectList}>
                {projects.map((p) => (
                  <li key={p.project_id}>{p.label ?? p.project_id}</li>
                ))}
              </ul>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onConfirm}>
              {formatMessage({
                id: 'confirmDeleteAccountConfirm',
                defaultMessage: 'Konto löschen',
              })}
            </Button>
            <Button appearance="secondary" onClick={onCancel}>
              {formatMessage({ id: 'cancel', defaultMessage: 'Abbrechen' })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
