import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { useEffect } from 'react'
import { FaCog } from 'react-icons/fa'
import { MdLogin, MdHome } from 'react-icons/md'
import {
  useNavigate,
  useLocation,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'
import { useAtom, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import {
  enforceMobileNavigationAtom,
  initialSyncingAtom,
  isMobileViewAtom,
  mapMaximizedAtom,
  operationsQueueAtom,
  pgliteDbAtom,
  isAppAmin,
  store,
  syncObjectAtom,
  tabsAtom,
} from '../../../store.ts'
import { constants } from '../../../modules/constants.ts'
import { Online } from './Online.tsx'
import styles from './Menu.module.css'
import { UserMenu } from './UserMenu/index.tsx'
import { Tabs } from './Tabs.tsx'
import { LanguageChooser } from '../../shared/LanguageChooser.tsx'
import { MenuBar } from '../../MenuBar/index.tsx'
import { signOut, useSession } from '../../../modules/authClient.ts'
import { isAppAdminEmail } from '../../../modules/appAdmins.ts'

const MOBILE_TAB_PRIORITY = ['data', 'map', 'tree'] as const

const pickMobileTab = (tabs: string[]) => {
  for (const tab of MOBILE_TAB_PRIORITY) {
    if (tabs.includes(tab)) return tab
  }
  return 'data'
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

  // If IndexedDB deletion was blocked (another tab/process), force restart path anyway.
  if (!dbDeletionSucceeded) {
    console.warn(
      'Some local IndexedDB databases could not be deleted completely.',
    )
  }
}

export const Menu = () => {
  const intl = useIntl()
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [isMobileView] = useAtom(isMobileViewAtom)
  const [enforceMobileNavigation] = useAtom(enforceMobileNavigationAtom)
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
  const setIsAppAmin = useSetAtom(isAppAmin)

  useEffect(() => {
    setIsAppAmin(isAppAdminEmail(authUser?.email))
  }, [authUser?.email, setIsAppAmin])

  useEffect(() => {
    if (!isMobileView) return

    const isNarrowViewport =
      typeof window !== 'undefined' &&
      window.innerWidth < constants.mobileViewMaxWidth
    const shouldCompactToSingleTab = isNarrowViewport || enforceMobileNavigation
    if (!shouldCompactToSingleTab) return

    const preferredTab = pickMobileTab(tabs)
    if (tabs.length !== 1 || tabs[0] !== preferredTab) {
      setTabs([preferredTab])
    }
  }, [enforceMobileNavigation, isMobileView, setTabs, tabs])

  const onChangeTabs = (_e, { checkedItems }) => {
    const nextTabs = checkedItems as string[]
    if (!isMobileView) {
      setTabs(nextTabs)
      return
    }

    const newlyActivatedTab = nextTabs.find((tab) => !tabs.includes(tab))
    const nextActiveTab =
      newlyActivatedTab ?? nextTabs[0] ?? tabs[0] ?? MOBILE_TAB_PRIORITY[0]

    setTabs([nextActiveTab])
  }

  const onClickOptions = () => {
    if (isAppStates) {
      return canGoBack ? history.go(-1) : navigate({ to: '/data' })
    }

    navigate({ to: `/data/app-states` })
  }

  const onConfirmLogout = async () => {
    await clearLocalSyncedData()
    setIsAppAmin(false)
    await signOut()
    window.location.assign('/')
  }

  const onClickEnter = () => navigate({ to: '/data/projects' })

  const onClickMapView = (e) => {
    // prevent toggling map tab
    e.stopPropagation()

    // if map is not included in app_sate.tabs, add it
    if (!tabs.includes('map')) {
      setTabs(isMobileView ? ['map'] : [...tabs, 'map'])
    }

    // toggle map maximized
    setMapIsMaximized(!mapIsMaximized)
  }

  const onClickHome = () => navigate({ to: '/' })

  return (
    <div className={`${styles.container} no-print`}>
      <Tabs
        tabs={tabs}
        isHome={isHome}
        mapIsMaximized={mapIsMaximized}
        onChangeTabs={onChangeTabs}
        onClickMapView={onClickMapView}
      />
      <MenuBar addMargin={false} showBorder={false} grow={false}>
        <Tooltip
          content={intl.formatMessage({
            id: 'navigationHome',
            defaultMessage: 'Home',
          })}
        >
          <Button
            size="medium"
            icon={<MdHome />}
            onClick={onClickHome}
            className={`${styles.button} ${styles.homeButtonMobileOnly}`}
            aria-label={intl.formatMessage({
              id: 'navigationHome',
              defaultMessage: 'Home',
            })}
          />
        </Tooltip>
        <LanguageChooser width={44} />
        {isAuthenticated ? (
          <UserMenu
            authUser={authUser}
            session={session}
            buttonClassName={styles.button}
            onConfirmLogout={onConfirmLogout}
          />
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
