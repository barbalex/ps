import { memo, useCallback } from 'react'
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

import { controls } from '../../../styles.ts'
import { on } from '../../../css.ts'
import { mapMaximizedAtom, tabsAtom } from '../../../store.ts'

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
export const Menu = memo(() => {
  const [tabs, setTabs] = useAtom(tabsAtom)
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const { history } = useRouter()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const { isAuthenticated, logout, user: authUser } = useCorbado()

  const isAppStates = pathname.includes('app-states')

  const [mapIsMaximized, setMapIsMaximized] = useAtom(mapMaximizedAtom)
  const onChangeTabs = useCallback(
    (e, { checkedItems }) => setTabs(checkedItems),
    [setTabs],
  )

  const onClickOptions = useCallback(() => {
    if (isAppStates) {
      return canGoBack ? history.go(-1) : navigate({ to: '/data' })
    }

    navigate({ to: `/data/app-states` })
  }, [canGoBack, history, isAppStates, navigate])

  const onClickLogout = useCallback(() => logout(), [logout])
  const onClickEnter = useCallback(
    () => navigate({ to: '/data/projects' }),
    [navigate],
  )

  const onClickMapView = useCallback(
    (e) => {
      // prevent toggling map tab
      e.stopPropagation()

      // if map is not included in app_sate.tabs, add it
      if (!tabs.includes('map')) {
        setTabs([...tabs, 'map'])
      }

      // toggle map maximized
      setMapIsMaximized(!mapIsMaximized)
    },
    [mapIsMaximized, setMapIsMaximized, setTabs, tabs],
  )

  const treeIsActive = tabs.includes('tree')
  const dataIsActive = tabs.includes('data')
  const mapIsActive = tabs.includes('map')

  return (
    <div style={controls}>
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
                  !mapIsActive ? undefined
                  : mapIsMaximized ?
                    <Tooltip content="Shrink Map">
                      <TbArrowsMinimize onClick={onClickMapView} />
                    </Tooltip>
                  : <Tooltip content="Maximize Map">
                      <TbArrowsMaximize onClick={onClickMapView} />
                    </Tooltip>

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
            style={pipe(
              {
                backgroundColor: 'rgba(38, 82, 37, 0)',
                border: 'none',
                color: 'white',
              },
              on('&:hover', { filter: 'brightness(85%)' }),
            )}
            disabled={mapIsMaximized}
          />
        </Tooltip>
      )}
      <Tooltip
        content={
          !isAuthenticated ? 'Login'
          : isHome ?
            'Enter'
          : `Logout ${authUser?.email}`
        }
      >
        <Button
          size="medium"
          icon={isAuthenticated && !isHome ? <MdLogout /> : <MdLogin />}
          onClick={isAuthenticated && !isHome ? onClickLogout : onClickEnter}
          style={pipe(
            {
              backgroundColor: 'rgba(38, 82, 37, 0)',
              border: 'none',
              color: 'white',
            },
            on('&:hover', { filter: 'brightness(85%)' }),
          )}
        />
      </Tooltip>
    </div>
  )
})
