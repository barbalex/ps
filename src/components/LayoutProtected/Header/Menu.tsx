import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { useEffect } from 'react'
import { MdLogin, MdHome, MdMenuBook } from 'react-icons/md'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import {
  docsReturnUrlAtom,
  enforceMobileNavigationAtom,
  isMobileViewAtom,
  mapMaximizedAtom,
  tabsAtom,
} from '../../../store.ts'
import { clearLocalSyncedData } from '../../../modules/clearLocalSyncedData.ts'
import { constants } from '../../../modules/constants.ts'
import { Online } from './Online.tsx'
import styles from './Menu.module.css'
import { UserMenu } from './UserMenu/index.tsx'
import { Tabs } from './Tabs.tsx'
import { LanguageChooser } from '../../shared/LanguageChooser.tsx'
import { MenuBar } from '../../MenuBar/index.tsx'
import { signOut, useSession } from '../../../modules/authClient.ts'

const MOBILE_TAB_PRIORITY = ['data', 'map', 'tree'] as const

const pickMobileTab = (tabs: string[]) => {
  for (const tab of MOBILE_TAB_PRIORITY) {
    if (tabs.includes(tab)) return tab
  }
  return 'data'
}

export const Menu = () => {
  const intl = useIntl()
  const [tabs, setTabs] = useAtom(tabsAtom)
  const [isMobileView] = useAtom(isMobileViewAtom)
  const [enforceMobileNavigation] = useAtom(enforceMobileNavigationAtom)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isInDocs = pathname.startsWith('/docs')
  const [docsReturnUrl, setDocsReturnUrl] = useAtom(docsReturnUrlAtom)

  const { data: session } = useSession()
  const authUser = session?.user
  const isAuthenticated = Boolean(authUser)

  const [mapIsMaximized, setMapIsMaximized] = useAtom(mapMaximizedAtom)

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

  const onConfirmLogout = async () => {
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
      setTabs(isMobileView ? ['map'] : [...tabs, 'map'])
    }

    // toggle map maximized
    setMapIsMaximized(!mapIsMaximized)
  }

  const onClickHome = () => navigate({ to: '/' })

  const onClickDocs = () => {
    if (isInDocs) {
      navigate({ to: docsReturnUrl ?? '/data/projects' })
      setDocsReturnUrl(null)
    } else {
      setDocsReturnUrl(pathname)
      navigate({ to: '/docs' })
    }
  }

  const docsLabel = isInDocs
    ? intl.formatMessage({ id: 'navigationDocsGoBack', defaultMessage: 'Zurück' })
    : intl.formatMessage({ id: 'navigationDocs', defaultMessage: 'Dokumentation' })

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
        <Tooltip content={docsLabel}>
          <Button
            size="medium"
            icon={<MdMenuBook />}
            onClick={onClickDocs}
            className={styles.button}
            aria-label={docsLabel}
          />
        </Tooltip>
        <Online width={44} />
      </MenuBar>
    </div>
  )
}
