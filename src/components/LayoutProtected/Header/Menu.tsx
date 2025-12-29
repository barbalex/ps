import {
  Button,
  Toolbar,
  ToolbarToggleButton,
  Tooltip,
} from '@fluentui/react-components'
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
import { pipe } from 'remeda'

import globalStyles from '../../../styles.module.css'
import { on } from '../../../css.ts'
import { mapMaximizedAtom, tabsAtom } from '../../../store.ts'
import { Online } from './Online.tsx'
import styles from './Menu.module.css'

const buildButtonStyle = ({ prevIsActive, nextIsActive, selfIsActive }) => {
  if (!selfIsActive) {
    return pipe(
      {
        backgroundColor: 'rgba(38, 82, 37, 0)',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.7)',
      },
      on('&:hover', { color: 'white' }),
    )
  }

  const style = {
    backgroundColor: 'rgba(38, 82, 37, 0)',
    borderTop: '1px solid rgba(255, 255, 255, 0.7)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.7)',
    borderRight: '1px solid rgba(255, 255, 255, 0.7)',
    borderLeft: prevIsActive ? 'none' : '1px solid rgba(255, 255, 255, 0.7)',
    color: 'white',
  }

  if (prevIsActive) {
    style.borderTopLeftRadius = 0
    style.borderBottomLeftRadius = 0
  }
  if (nextIsActive) {
    style.borderTopRightRadius = 0
    style.borderBottomRightRadius = 0
  }

  return style
}

// TODO:
// use overflow menu for tabs and app-states
export const Menu = () => {
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
    <div className={globalStyles.controls}>
      <Toolbar
        aria-label="active tabs"
        checkedValues={{ tabs }}
        onCheckedValueChange={onChangeTabs}
      >
        {!isHome && (
          <>
            <ToolbarToggleButton
              aria-label="Tree"
              name="tabs"
              value="tree"
              style={buildButtonStyle({
                prevIsActive: false,
                nextIsActive: dataIsActive,
                selfIsActive: treeIsActive,
              })}
              disabled={mapIsMaximized}
            >
              Tree
            </ToolbarToggleButton>
            <ToolbarToggleButton
              aria-label="Data"
              name="tabs"
              value="data"
              style={buildButtonStyle({
                prevIsActive: treeIsActive,
                nextIsActive: mapIsActive,
                selfIsActive: dataIsActive,
              })}
              disabled={mapIsMaximized}
            >
              Data
            </ToolbarToggleButton>
            <Tooltip content={mapIsActive ? 'Hide Map' : 'Show Map'}>
              <ToolbarToggleButton
                icon={
                  !mapIsActive ? undefined : mapIsMaximized ? (
                    <Tooltip content="Shrink Map">
                      <TbArrowsMinimize onClick={onClickMapView} />
                    </Tooltip>
                  ) : (
                    <Tooltip content="Maximize Map">
                      <TbArrowsMaximize onClick={onClickMapView} />
                    </Tooltip>
                  )
                }
                iconPosition="after"
                aria-label="Map"
                name="tabs"
                value="map"
                style={buildButtonStyle({
                  prevIsActive: dataIsActive,
                  nextIsActive: false,
                  selfIsActive: mapIsActive,
                })}
              >
                Map
              </ToolbarToggleButton>
            </Tooltip>
          </>
        )}
      </Toolbar>
      {!isHome && (
        <Tooltip content={isAppStates ? 'Back' : 'Options'}>
          <Button
            size="medium"
            icon={<FaCog />}
            onClick={onClickOptions}
            className={styles.button}
            disabled={mapIsMaximized}
          />
        </Tooltip>
      )}
      <Online />
      <Tooltip
        content={
          !isAuthenticated
            ? 'Login'
            : isHome
              ? 'Enter'
              : `Logout ${authUser?.email}`
        }
      >
        <Button
          size="medium"
          icon={isAuthenticated && !isHome ? <MdLogout /> : <MdLogin />}
          onClick={isAuthenticated && !isHome ? onClickLogout : onClickEnter}
          className={styles.button}
        />
      </Tooltip>
    </div>
  )
}
