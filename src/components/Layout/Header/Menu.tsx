import { memo, useCallback, useMemo } from 'react'
import {
  Button,
  Toolbar,
  ToolbarToggleButton,
} from '@fluentui/react-components'
import { FaCog } from 'react-icons/fa'
import { MdLogout, MdLogin } from 'react-icons/md'
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
} from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado, useCorbadoSession } from '@corbado/react'

import { controls } from '../../../styles'
import { css } from '../../../css'
import { useElectric } from '../../../ElectricProvider'

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
    border: '1px solid rgba(255, 255, 255, 0.7)',
    color: 'white',
  }

  if (prevIsActive) {
    style.borderTopLeftRadius = 0
    style.borderBottomLeftRadius = 0
    style.borderLeft = 'none'
  }
  if (nextIsActive) {
    style.borderTopRightRadius = 0
    style.borderBottomRightRadius = 0
  }
  return style
}

// TODO:
// use overflow menu for tabs and app-state
export const Menu = memo(() => {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()

  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const { isAuthenticated, logout } = useCorbado()
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )
  const tabs = useMemo(() => appState?.tabs ?? [], [appState?.tabs])
  const onChangeTabs = useCallback(
    (e, { checkedItems }) => {
      db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { tabs: checkedItems },
      })
    },
    [appState?.app_state_id, db.app_states],
  )

  const onClickOptions = useCallback(() => {
    if (params.user_email) return navigate(-1)

    navigate({
      pathname: `/app-state/${appState?.app_state_id}`,
      search: searchParams.toString(),
    })
  }, [appState?.app_state_id, navigate, params.user_email, searchParams])

  const onClickLogout = useCallback(() => logout(), [logout])
  const onClickEnter = useCallback(() => navigate('/projects'), [navigate])

  const treeIsActive = tabs.includes('tree')
  const dataIsActive = tabs.includes('data')
  const filterIsActive = tabs.includes('filter')
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
                  nextIsActive: filterIsActive,
                  selfIsActive: dataIsActive,
                }),
              )}
            >
              Data
            </ToolbarToggleButton>
            <ToolbarToggleButton
              aria-label="Filter"
              name="tabs"
              value="filter"
              style={css(
                buildButtonStyle({
                  prevIsActive: dataIsActive,
                  nextIsActive: mapIsActive,
                  selfIsActive: filterIsActive,
                }),
              )}
            >
              Filter
            </ToolbarToggleButton>
            <ToolbarToggleButton
              aria-label="Map"
              name="tabs"
              value="map"
              style={css(
                buildButtonStyle({
                  prevIsActive: filterIsActive,
                  nextIsActive: false,
                  selfIsActive: mapIsActive,
                }),
              )}
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
          title="Options"
          style={css({
            backgroundColor: 'rgba(38, 82, 37, 0)',
            border: 'none',
            color: 'white',
            on: ($) => [$('&:hover', { filter: 'brightness(85%)' })],
          })}
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
