import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Toolbar, ToolbarToggleButton, Tooltip } =
  fluentUiReactComponents
import { FaCog } from 'react-icons/fa'
import { TbArrowsMaximize, TbArrowsMinimize } from 'react-icons/tb'
import { MdLogout, MdLogin } from 'react-icons/md'
import {
  useNavigate,
  useLocation,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'
import { useCorbado } from '@corbado/react'
import { useAtom } from 'jotai'
import { useIntl, FormattedMessage } from 'react-intl'

import { mapMaximizedAtom, tabsAtom } from '../../../store.ts'
import { Online } from './Online.tsx'
import styles from './Menu.module.css'
import { LanguageChooser } from '../../shared/LanguageChooser.tsx'
import { MenuBar } from '../../MenuBar/index.tsx'

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

  const { isAuthenticated, logout, user: authUser } = useCorbado()

  const isAppStates = pathname.includes('app-states')

  const [mapIsMaximized, setMapIsMaximized] = useAtom(mapMaximizedAtom)
  const onChangeTabs = (e, { checkedItems }) => setTabs(checkedItems)

  const onClickOptions = () => {
    if (isAppStates) {
      return canGoBack ? history.go(-1) : navigate({ to: '/data' })
    }

    navigate({ to: `/data/app-states` })
  }

  const onClickLogout = logout
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
        <LanguageChooser width={44} />
        <Online width={44} />
        <Tooltip
          content={
            !isAuthenticated
              ? intl.formatMessage({ defaultMessage: 'Anmelden' })
              : isHome
                ? intl.formatMessage({ defaultMessage: 'App öffnen' })
                : intl.formatMessage(
                    { defaultMessage: 'Abmelden {email}' },
                    { email: authUser?.email },
                  )
          }
        >
          <Button
            size="medium"
            icon={isAuthenticated && !isHome ? <MdLogout /> : <MdLogin />}
            onClick={isAuthenticated && !isHome ? onClickLogout : onClickEnter}
            className={styles.button}
          />
        </Tooltip>
      </MenuBar>
    </div>
  )
}
