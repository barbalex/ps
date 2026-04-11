import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Avatar,
  Button,
  Menu: FluentMenu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Toolbar,
  ToolbarToggleButton,
  Tooltip,
} = fluentUiReactComponents
import { FaCog } from 'react-icons/fa'
import { TbArrowsMaximize, TbArrowsMinimize } from 'react-icons/tb'
import { MdLogout, MdLogin } from 'react-icons/md'
import {
  useNavigate,
  useLocation,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useIntl, FormattedMessage } from 'react-intl'

import {
  initialSyncingAtom,
  mapMaximizedAtom,
  operationsQueueAtom,
  pgliteDbAtom,
  sqlInitializingAtom,
  store,
  syncObjectAtom,
  tabsAtom,
} from '../../../store.ts'
import { Online } from './Online.tsx'
import styles from './Menu.module.css'
import { LanguageChooser } from '../../shared/LanguageChooser.tsx'
import { MenuBar } from '../../MenuBar/index.tsx'
import { signOut, useSession } from '../../../modules/authClient.ts'

const buildToggleClass = ({ prevIsActive, nextIsActive, selfIsActive }) => {
  if (!selfIsActive) {
    return styles.toggleInactive
  }

  let className = styles.toggleActive

  if (prevIsActive) {
    className += ` ${styles.togglePrevIsActive}`
  }
  if (nextIsActive) {
    className += ` ${styles.toggleNextIsActive}`
  }

  return className
}

const deleteIndexedDbDatabase = (dbName: string) =>
  new Promise<boolean>((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(true)
      return
    }

    const request = indexedDB.deleteDatabase(dbName)
    request.onsuccess = () => resolve(true)
    request.onerror = () => resolve(false)
    request.onblocked = () => resolve(false)
  })

const deleteAppIndexedDbDatabases = async () => {
  const fallbackDbNames = ['ps', 'idb://ps']
  const discoveredDbNames =
    typeof indexedDB !== 'undefined' && 'databases' in indexedDB
      ? await indexedDB
          .databases()
          .then((dbs) => dbs.map((db) => db.name).filter(Boolean) as string[])
          .catch(() => [])
      : []

  const dbNamesToDelete = [
    ...new Set([...fallbackDbNames, ...discoveredDbNames]),
  ].filter((name) => /ps|pglite|electric/i.test(name))

  const deleteResults = await Promise.all(
    dbNamesToDelete.map((name) => deleteIndexedDbDatabase(name)),
  )

  return deleteResults.every(Boolean)
}

const clearBrowserCaches = async () => {
  if (typeof caches === 'undefined') return
  try {
    const cacheKeys = await caches.keys()
    await Promise.all(cacheKeys.map((key) => caches.delete(key)))
  } catch {
    // ignore cache cleanup failures
  }
}

const clearPersistedSyncUiState = () => {
  const localStorageKeysToKeep = new Set([
    'language',
    'enforceDesktopNavigation',
    'enforceMobileNavigation',
    'isDesktopView',
  ])

  for (const key of Object.keys(window.localStorage)) {
    if (!localStorageKeysToKeep.has(key)) {
      window.localStorage.removeItem(key)
    }
  }

  const sessionStorageKeysToKeep = new Set<string>()
  for (const key of Object.keys(window.sessionStorage)) {
    if (!sessionStorageKeysToKeep.has(key)) {
      window.sessionStorage.removeItem(key)
    }
  }

  // Keep explicit list for readability and future discoverability
  const localStorageKeysToClear = [
    'tabsAtom',
    'operationsQueueAtom',
    'initialSyncingAtom',
    'sqlInitializingAtom',
    'mapMaximizedAtom',
    'showLocalMapAtom',
    'localMapValuesAtom',
    'mapInfoAtom',
    'mapLayerSortingAtom',
    'mapDrawerVectorLayerDisplayAtom',
    'treeOpenNodesAtom',
    'seenWmsServiceKeysAtom',
    'seenWfsServiceKeysAtom',
    'qcsRunOnlyWithResults',
    'qcsRunLabelFilter',
    'rootQcsRunOnlyWithResults',
    'rootQcsRunLabelFilter',
    'projectQcsRunOnlyWithResults',
    'projectQcsRunLabelFilter',
  ]

  for (const key of localStorageKeysToClear) {
    window.localStorage.removeItem(key)
  }
}

const clearLocalSyncedData = async () => {
  // stop active sync stream before deleting local database
  const syncObject = store.get(syncObjectAtom) as {
    unsubscribe?: () => void
  } | null
  syncObject?.unsubscribe?.()
  store.set(syncObjectAtom, null)

  const db = store.get(pgliteDbAtom) as { close?: () => Promise<void> | void }
  await db?.close?.()

  const dbDeletionSucceeded = await deleteAppIndexedDbDatabases()
  await clearBrowserCaches()
  clearPersistedSyncUiState()

  store.set(pgliteDbAtom, null)
  store.set(operationsQueueAtom, [])
  store.set(initialSyncingAtom, true)
  store.set(sqlInitializingAtom, true)

  // If IndexedDB deletion was blocked (another tab/process), force restart path anyway.
  if (!dbDeletionSucceeded) {
    console.warn(
      'Some local IndexedDB databases could not be deleted completely.',
    )
  }
}

// TODO:
// use overflow menu for tabs and app-states
export const Menu = () => {
  const intl = useIntl()
  const [tabs, setTabs] = useAtom(tabsAtom)
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const { history } = useRouter()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const { data: session } = useSession()
  const authUser = session?.user
  const isAuthenticated = Boolean(authUser)

  const isAppStates = pathname.includes('app-states')

  const [mapIsMaximized, setMapIsMaximized] = useAtom(mapMaximizedAtom)
  const onChangeTabs = (e, { checkedItems }) => setTabs(checkedItems)

  const onClickOptions = () => {
    if (isAppStates) {
      return canGoBack ? history.go(-1) : navigate({ to: '/data' })
    }

    navigate({ to: `/data/app-states` })
  }

  const onClickLogout = async () => {
    const operationsQueue = store.get(operationsQueueAtom) as unknown[]
    const pendingOperationsCount = operationsQueue?.length ?? 0

    if (pendingOperationsCount > 0) {
      const proceedWithPendingOps = window.confirm(
        intl.formatMessage(
          {
            defaultMessage:
              'ACHTUNG: Es sind noch {count} ausstehende lokale Operationen vorhanden.\n\nWenn Sie sich jetzt abmelden, werden diese lokalen Daten gelöscht und können nicht mehr synchronisiert werden.\n\nEmpfehlung: Warten Sie, bis alle Operationen mit dem Server synchronisiert wurden.\n\nTrotzdem abmelden?',
          },
          { count: pendingOperationsCount },
        ),
      )

      if (!proceedWithPendingOps) return
    }

    const confirmLocalWipe = window.confirm(
      intl.formatMessage({
        id: 'logoutLocalDataWipeConfirm',
        defaultMessage:
          'Beim Abmelden werden lokale Daten auf diesem Gerät gelöscht, damit der nächste Benutzer keine alten (= ihre) Daten sieht. Ihre Daten wurden auf den Server synchronisiert. Daher gehen sie nicht verloren und werden bei Ihrer nächsten Anmeldung wieder verfügbar.\n\nJetzt abmelden?',
      }),
    )

    if (!confirmLocalWipe) return

    await clearLocalSyncedData()
    await signOut()
    window.location.assign('/')
  }
  const onClickEnter = () => navigate({ to: '/data/projects' })

  const onClickMapView = (e) => {
    // prevent toggling map tab
    e.stopPropagation()

    // if map is not included in app_sate.tabs, add it
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }

    // toggle map maximized
    setMapIsMaximized(!mapIsMaximized)
  }

  const treeIsActive = tabs.includes('tree')
  const dataIsActive = tabs.includes('data')
  const mapIsActive = tabs.includes('map')

  return (
    <div className={`${styles.container} no-print`}>
      <Toolbar
        className={styles.toolbar}
        aria-label="active tabs"
        checkedValues={{ tabs }}
        onCheckedValueChange={onChangeTabs}
      >
        {!isHome && (
          <>
            <Tooltip
              content={
                treeIsActive
                  ? intl.formatMessage({ defaultMessage: 'Baum ausblenden' })
                  : intl.formatMessage({ defaultMessage: 'Baum einblenden' })
              }
            >
              <ToolbarToggleButton
                aria-label={intl.formatMessage({ defaultMessage: 'Baum' })}
                name="tabs"
                value="tree"
                className={buildToggleClass({
                  prevIsActive: false,
                  nextIsActive: dataIsActive,
                  selfIsActive: treeIsActive,
                })}
                disabled={mapIsMaximized}
              >
                <FormattedMessage defaultMessage="Baum" />
              </ToolbarToggleButton>
            </Tooltip>
            <Tooltip
              content={
                dataIsActive
                  ? intl.formatMessage({ defaultMessage: 'Daten ausblenden' })
                  : intl.formatMessage({ defaultMessage: 'Daten einblenden' })
              }
            >
              <ToolbarToggleButton
                aria-label={intl.formatMessage({ defaultMessage: 'Daten' })}
                name="tabs"
                value="data"
                className={buildToggleClass({
                  prevIsActive: treeIsActive,
                  nextIsActive: mapIsActive,
                  selfIsActive: dataIsActive,
                })}
                disabled={mapIsMaximized}
              >
                <FormattedMessage defaultMessage="Daten" />
              </ToolbarToggleButton>
            </Tooltip>
            <Tooltip
              content={
                mapIsActive
                  ? intl.formatMessage({ defaultMessage: 'Karte ausblenden' })
                  : intl.formatMessage({ defaultMessage: 'Karte einblenden' })
              }
            >
              <ToolbarToggleButton
                icon={
                  !mapIsActive ? undefined : mapIsMaximized ? (
                    <Tooltip
                      content={intl.formatMessage({
                        defaultMessage: 'Karte verkleinern',
                      })}
                    >
                      <TbArrowsMinimize
                        onClick={onClickMapView}
                        className={styles.mapIcon}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip
                      content={intl.formatMessage({
                        defaultMessage: 'Karte maximieren',
                      })}
                    >
                      <TbArrowsMaximize
                        onClick={onClickMapView}
                        className={styles.mapIcon}
                      />
                    </Tooltip>
                  )
                }
                iconPosition="after"
                aria-label={intl.formatMessage({ defaultMessage: 'Karte' })}
                name="tabs"
                value="map"
                className={buildToggleClass({
                  prevIsActive: dataIsActive,
                  nextIsActive: false,
                  selfIsActive: mapIsActive,
                })}
              >
                <FormattedMessage defaultMessage="Karte" />
              </ToolbarToggleButton>
            </Tooltip>
          </>
        )}
      </Toolbar>
      <MenuBar addMargin={false} showBorder={false} grow={false}>
        <LanguageChooser width={44} />
        {isAuthenticated ? (
          <FluentMenu positioning="below-end">
            <Tooltip
              content={intl.formatMessage(
                { defaultMessage: '{email}' },
                { email: authUser?.email ?? '' },
              )}
            >
              <MenuTrigger disableButtonEnhancement>
                <Button
                  size="medium"
                  className={styles.button}
                  aria-label={intl.formatMessage({
                    defaultMessage: 'Benutzermenü öffnen',
                  })}
                  icon={
                    <Avatar
                      size={24}
                      name={authUser?.fullName ?? authUser?.email ?? 'User'}
                    />
                  }
                />
              </MenuTrigger>
            </Tooltip>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<MdLogout />} onClick={onClickLogout}>
                  <FormattedMessage defaultMessage="Abmelden" />
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </FluentMenu>
        ) : (
          <Tooltip
            content={
              isHome
                ? intl.formatMessage({ defaultMessage: 'App öffnen' })
                : intl.formatMessage({ defaultMessage: 'Anmelden' })
            }
          >
            <Button
              size="medium"
              icon={<MdLogin />}
              onClick={onClickEnter}
              className={styles.button}
            />
          </Tooltip>
        )}
        <Online width={44} />
        {!isHome && (
          <Tooltip
            content={
              isAppStates
                ? intl.formatMessage({ defaultMessage: 'Zurück' })
                : intl.formatMessage({ defaultMessage: 'Optionen' })
            }
          >
            <Button
              size="medium"
              icon={<FaCog />}
              onClick={onClickOptions}
              className={styles.button}
              disabled={mapIsMaximized}
            />
          </Tooltip>
        )}
      </MenuBar>
    </div>
  )
}
