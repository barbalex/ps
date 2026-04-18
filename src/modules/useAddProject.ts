import { useAtomValue, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import {
  userIdAtom,
  addNotificationAtom,
  chooseAccountForProjectAtom,
} from '../store.ts'
import { createProject } from './createRows.ts'

/**
 * Returns an `addProject` callback that handles the full "create project" flow:
 * - 0 accounts  → shows a warning notification and redirects to the accounts list
 * - 1 account   → creates the project immediately
 * - >1 accounts → opens the account-chooser dialog, then creates the project
 *
 * `onSuccess` receives the new project_id and should perform the navigation.
 */
export const useAddProject = (onSuccess: (project_id: string) => void) => {
  const { formatMessage } = useIntl()
  const db = usePGlite()
  const navigate = useNavigate()
  const userId = useAtomValue(userIdAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const setChooseAccount = useSetAtom(chooseAccountForProjectAtom)

  const addProject = async () => {
    const accountsRes = await db.query<{
      account_id: string
      label: string | null
    }>(
      `SELECT account_id, label FROM accounts WHERE user_id = $1 ORDER BY label`,
      [userId],
    )
    const accounts = accountsRes?.rows ?? []

    if (accounts.length === 0) {
      addNotification({
        title: formatMessage({
          id: 'noAccountTitle',
          defaultMessage: 'Kein Konto vorhanden',
        }),
        body: formatMessage({
          id: 'noAccountBody',
          defaultMessage:
            'Um Projekte zu erstellen, bitte zuerst ein Konto anlegen.',
        }),
        intent: 'warning',
      })
      navigate({ to: `/data/users/${userId}/accounts/` })
      return
    }

    if (accounts.length === 1) {
      const project_id = await createProject(accounts[0].account_id)
      if (!project_id) return
      onSuccess(project_id)
      return
    }

    // Multiple accounts: open the chooser dialog
    setChooseAccount({
      accounts,
      onAccountSelected: async (account_id) => {
        const project_id = await createProject(account_id)
        if (!project_id) return
        onSuccess(project_id)
      },
    })
  }

  return addProject
}
