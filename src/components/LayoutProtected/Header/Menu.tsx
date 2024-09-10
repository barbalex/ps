import { memo, useCallback } from 'react'
import {
  Button,
  Toolbar,
  ToolbarToggleButton,
} from '@fluentui/react-components'
import { FaCog } from 'react-icons/fa'
import { TbArrowsMaximize, TbArrowsMinimize } from 'react-icons/tb'
import { MdLogout, MdLogin } from 'react-icons/md'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useCorbado } from '@corbado/react'
import { useAtom } from 'jotai'

import { controls } from '../../../styles.ts'
import { css } from '../../../css.ts'
import { mapMaximizedAtom, tabsAtom } from '../../../store.ts'

const buildButtonStyle = ({ prevIsActive, nextIsActive, selfIsActive }) => {
  if (!selfIsActive) {
    return {
      backgroundColor: 'rgba(38, 82, 37, 0)',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.7)',
      on: ($) => [$('&:hover', { color: 'white' })],
    }
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
  const [searchParams] = useSearchParams()

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
    if (isAppStates) return navigate(-1)

    // TODO: change route to app-state
    navigate({
      pathname: `/data/app-states`,
      search: searchParams.toString(),
    })
  }, [isAppStates, navigate, searchParams])

  const onClickLogout = useCallback(() => logout(), [logout])
  const onClickEnter = useCallback(() => navigate('/data/projects'), [navigate])

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
              style={css(
                buildButtonStyle({
                  prevIsActive: false,
                  nextIsActive: dataIsActive,
                  selfIsActive: treeIsActive,
                }),
              )}
              disabled={mapIsMaximized}
            >
              Tree
            </ToolbarToggleButton>
            <ToolbarToggleButton
              aria-label="Data"
              name="tabs"
              value="data"
              style={css(
                buildButtonStyle({
                  prevIsActive: treeIsActive,
                  nextIsActive: mapIsActive,
                  selfIsActive: dataIsActive,
                }),
              )}
              disabled={mapIsMaximized}
            >
              Data
            </ToolbarToggleButton>
            <ToolbarToggleButton
              icon={
                mapIsMaximized ? (
                  <TbArrowsMinimize
                    onClick={onClickMapView}
                    title="Shrink Map"
                  />
                ) : (
                  <TbArrowsMaximize
                    onClick={onClickMapView}
                    title="Maximize Map"
                  />
                )
              }
              iconPosition="after"
              aria-label="Map"
              name="tabs"
              value="map"
              style={css(
                buildButtonStyle({
                  prevIsActive: dataIsActive,
                  nextIsActive: false,
                  selfIsActive: mapIsActive,
                }),
              )}
              title={tabs.includes('map') ? 'Hide Map' : 'Show Map'}
            >
              Map
            </ToolbarToggleButton>
          </>
        )}
      </Toolbar>
      {!isHome && (
        <Button
          size="medium"
          icon={<FaCog />}
          onClick={onClickOptions}
          title={isAppStates ? 'Back' : 'Options'}
          style={css({
            backgroundColor: 'rgba(38, 82, 37, 0)',
            border: 'none',
            color: 'white',
            on: ($) => [$('&:hover', { filter: 'brightness(85%)' })],
          })}
          disabled={mapIsMaximized}
        />
      )}
      <Button
        size="medium"
        icon={isAuthenticated && !isHome ? <MdLogout /> : <MdLogin />}
        onClick={isAuthenticated && !isHome ? onClickLogout : onClickEnter}
        title={
          !isAuthenticated
            ? 'Login'
            : isHome
            ? 'Enter'
            : `Logout ${authUser?.email}`
        }
        style={css({
          backgroundColor: 'rgba(38, 82, 37, 0)',
          border: 'none',
          color: 'white',
          on: ($) => [$('&:hover', { filter: 'brightness(85%)' })],
        })}
      />
    </div>
  )
})
