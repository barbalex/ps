import { useState } from 'react'
import { useSetAtom } from 'jotai'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner } = fluentUiReactComponents
import { pgDump } from '@electric-sql/pglite-tools/pg_dump'
import { useIntl } from 'react-intl'
import type { PGlite } from '@electric-sql/pglite'

import { usePGlite } from '@electric-sql/pglite-react'
import { addNotificationAtom } from '../../store.ts'

type Props = {
  activeUserId: string | null | undefined
  viewedUserId: string | null | undefined
}

const downloadFile = (data: BlobPart, filename: string) => {
  const blob = new Blob([data], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 200)
}

export const DbDump = ({ activeUserId, viewedUserId }: Props) => {
  const db = usePGlite()
  const { formatMessage } = useIntl()
  const addNotification = useSetAtom(addNotificationAtom)

  const [dumping, setDumping] = useState(false)

  const isOwnProfile =
    !!activeUserId && !!viewedUserId && activeUserId === viewedUserId

  const downloadDump = async () => {
    if (!isOwnProfile || !activeUserId) return
    setDumping(true)
    try {
      // Export only data owned by the active user by pruning non-owned rows
      // inside a transaction and rolling back after pg_dump.
      await db.query('BEGIN')

      await db.query(`DELETE FROM users WHERE user_id <> $1`, [activeUserId])
      await db.query(
        `DELETE FROM auth_sessions WHERE user_id IS NULL OR user_id <> $1`,
        [activeUserId],
      )
      await db.query(
        `DELETE FROM auth_accounts WHERE user_id IS NULL OR user_id <> $1`,
        [activeUserId],
      )
      await db.query(
        `DELETE FROM user_messages WHERE user_id IS NULL OR user_id <> $1`,
        [activeUserId],
      )
      await db.query(
        `DELETE FROM accounts WHERE user_id IS NULL OR user_id <> $1`,
        [activeUserId],
      )

      await db.query(
        `DELETE FROM projects
         WHERE account_id IS NULL
            OR account_id NOT IN (SELECT account_id FROM accounts WHERE user_id = $1)`,
        [activeUserId],
      )

      // Keep only this user's membership rows in owned records.
      await db.query(
        `DELETE FROM project_users WHERE user_id IS NULL OR user_id <> $1`,
        [activeUserId],
      )
      await db.query(
        `DELETE FROM subproject_roles WHERE user_id IS NULL OR user_id <> $1`,
        [activeUserId],
      )
      await db.query(
        `DELETE FROM place_roles WHERE user_id IS NULL OR user_id <> $1`,
        [activeUserId],
      )

      const dump = await pgDump({ pg: db as unknown as PGlite })
      await db.query('ROLLBACK')

      downloadFile(dump, 'arten-foerdern-owned.sql')
    } catch (error) {
      try {
        await db.query('ROLLBACK')
      } catch {
        // ignore rollback errors
      }
      addNotification({
        intent: 'error',
        title: formatMessage({
          id: 'dbDump.failedTitle',
          defaultMessage: 'Export failed',
        }),
        body: formatMessage({
          id: 'dbDump.failedBody',
          defaultMessage:
            'Your data export could not be created. Please try again.',
        }),
      })
      console.error('Could not export owned data dump:', error)
    } finally {
      setDumping(false)
    }
  }

  if (!isOwnProfile) return null

  return (
    <Button
      size="medium"
      icon={dumping ? <Spinner size="tiny" /> : null}
      onClick={downloadDump}
    >
      <div>
        {dumping
          ? formatMessage({
              id: 'dbDump.downloading',
              defaultMessage: 'Alle Daten werden heruntergeladen...',
            })
          : formatMessage({
              id: 'dbDump.download',
              defaultMessage: 'Alle Daten herunterladen (als sql Datei)',
            })}
      </div>
    </Button>
  )
}
