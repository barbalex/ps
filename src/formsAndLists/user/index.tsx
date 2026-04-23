import { useRef, useState } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom, useSetAtom } from 'jotai'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { useIntl } from 'react-intl'
import { FaPlus } from 'react-icons/fa'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { FilterButton } from '../../components/shared/FilterButton.tsx'
import { Accounts } from '../accounts.tsx'
import { createAccount } from '../../modules/createRows.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { DbDump } from '../appStates/DbDump.tsx'
import { DeleteAccountDialog } from './DeleteAccountDialog.tsx'
import {
  addOperationAtom,
  accountsFilterAtom,
  enforceDesktopNavigationAtom,
  enforceMobileNavigationAtom,
  alwaysShowTreeAtom,
  userIdAtom,
} from '../../store.ts'
import type Users from '../../models/public/Users.ts'

import styles from './index.module.css'
import '../../form.css'

export const User = () => {
  const intl = useIntl()
  const { userId } = useParams({ strict: false })
  const location = useLocation()
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [accountsFilter] = useAtom(accountsFilterAtom)

  const [enforceMobileNavigation, setEnforceMobileNavigation] = useAtom(
    enforceMobileNavigationAtom,
  )
  const [enforceDesktopNavigation, setEnforceDesktopNavigation] = useAtom(
    enforceDesktopNavigationAtom,
  )
  const [alwaysShowTree, setAlwaysShowTree] = useAtom(alwaysShowTreeAtom)
  const [currentUserId] = useAtom(userIdAtom)

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM users WHERE user_id = $1`, [userId])
  const row: Users | undefined = res?.rows?.[0]

  const accountsCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM accounts WHERE user_id = $1`,
    [userId],
  )
  const accountsCount = accountsCountRes?.rows?.[0]?.count ?? 0

  const accountsUrl = `/data/users/${userId}/accounts`
  const isAccountsOpen =
    location.pathname === accountsUrl ||
    location.pathname.startsWith(`${accountsUrl}/`)
  const isAccountsList = /\/accounts\/?$/.test(location.pathname)

  const accountsIsFiltered = !!filterStringFromFilter(accountsFilter)
  const newLabel = intl.formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })

  const onClickAddAccount = async () => {
    const id = await createAccount({ userId })
    if (!id) return
    navigate({ to: `${accountsUrl}/${id}` })
  }

  const accountsHeaderActions = isAccountsList ? (
    <>
      <FilterButton isFiltered={accountsIsFiltered} />
      <Button
        size="medium"
        title={newLabel}
        icon={<FaPlus />}
        onClick={onClickAddAccount}
      />
    </>
  ) : undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return
    const sql = `UPDATE users SET ${name} = $1 WHERE user_id = $2`
    try {
      await db.query(sql, [value, userId])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'users',
      rowIdName: 'user_id',
      rowId: userId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />
  if (!row) return <NotFound table="User" id={userId} />

  // When accounts_in_user is false but we are on an accounts route, show
  // the accounts view standalone (same pattern as account form / project-fields)
  if (isAccountsOpen && !row.accounts_in_user) {
    return <Outlet />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={row.email ?? ''}
            onChange={onChange}
            autoFocus
            ref={autoFocusRef}
            validationState={validations?.email?.state}
            validationMessage={validations?.email?.message}
          />

          {currentUserId === userId && (
            <Section
              title={intl.formatMessage({
                id: 'user.appSettings',
                defaultMessage: 'App-Einstellungen',
              })}
            >
              <SwitchField
                label={intl.formatMessage({
                  id: 'user.enforceMobileNavigation.label',
                  defaultMessage: 'Mobile Navigation erzwingen',
                })}
                value={enforceMobileNavigation}
                onChange={() =>
                  setEnforceMobileNavigation(!enforceMobileNavigation)
                }
                validationMessage={intl.formatMessage({
                  id: 'user.enforceMobileNavigation.help',
                  defaultMessage:
                    'Wenn aktiviert, wird die mobile Navigation erzwungen.',
                })}
              />
              <SwitchField
                label={intl.formatMessage({
                  id: 'user.enforceDesktopNavigation.label',
                  defaultMessage: 'Desktop-Navigation erzwingen',
                })}
                value={enforceDesktopNavigation}
                onChange={() =>
                  setEnforceDesktopNavigation(!enforceDesktopNavigation)
                }
                validationMessage={intl.formatMessage({
                  id: 'user.enforceDesktopNavigation.help',
                  defaultMessage:
                    'Wenn aktiviert, wird die Desktop-Navigation erzwungen.',
                })}
              />
              <SwitchField
                label={intl.formatMessage({
                  id: 'user.alwaysShowTree.label',
                  defaultMessage: 'Navigationsbaum immer anzeigen',
                })}
                value={alwaysShowTree}
                onChange={() => setAlwaysShowTree(!alwaysShowTree)}
                validationMessage={intl.formatMessage({
                  id: 'user.alwaysShowTree.help',
                  defaultMessage:
                    'Wenn aktiviert, wird der Navigationsbaum immer angezeigt (auf dem Handy wenig praktisch).',
                })}
              />
              <SwitchField
                label={intl.formatMessage({
                  id: 'account.projectFieldsInAccount.label',
                  defaultMessage: 'Projekt-Felder im Kontoformular',
                })}
                name="project_fields_in_account"
                value={row?.project_fields_in_account ?? true}
                onChange={onChange}
                validationMessage={intl.formatMessage({
                  id: 'account.projectFieldsInAccount.help',
                  defaultMessage:
                    'Projekt-Felder im Kontoformular anzeigen statt in einer separaten Navigation.',
                })}
              />
              <SwitchField
                label={intl.formatMessage({
                  id: 'user.accountsInUser.label',
                  defaultMessage: 'Konten im Benutzerformular',
                })}
                name="accounts_in_user"
                value={row?.accounts_in_user ?? false}
                onChange={onChange}
                validationMessage={intl.formatMessage({
                  id: 'user.accountsInUser.help',
                  defaultMessage:
                    'Konten direkt im Benutzerformular anzeigen statt in einer separaten Navigation.',
                })}
              />
            </Section>
          )}

          {currentUserId === userId && (
            <Section
              title={intl.formatMessage({
                id: 'user.data',
                defaultMessage: 'Daten',
              })}
            >
              <DbDump activeUserId={currentUserId} viewedUserId={userId} />
              <Button
                appearance="outline"
                onClick={() => setDeleteAccountOpen(true)}
              >
                {intl.formatMessage({
                  id: 'deleteAccountBtn',
                  defaultMessage: 'Konto löschen',
                })}
              </Button>
              <DeleteAccountDialog
                open={deleteAccountOpen}
                onClose={() => setDeleteAccountOpen(false)}
                userId={userId}
              />
            </Section>
          )}

          {row.accounts_in_user && (
            <Section
              title={`${intl.formatMessage({ id: '/40i9A', defaultMessage: 'Konten' })} (${accountsCount})`}
              parentUrl={`/data/users/${userId}`}
              listUrl={accountsUrl}
              isOpen={isAccountsOpen}
              titleClassName={styles.sectionTitle}
              childrenClassName={styles.sectionChildren}
              headerActions={accountsHeaderActions}
            >
              {isAccountsOpen &&
                (isAccountsList ? <Accounts hideHeader /> : <Outlet />)}
            </Section>
          )}
        </>
      </div>
    </div>
  )
}
