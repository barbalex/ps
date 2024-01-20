import { memo, useCallback, useMemo } from 'react'
import {
  Button,
  Toolbar,
  ToolbarToggleButton,
} from '@fluentui/react-components'
import { FaCog } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { user_id } from '../../SqlInitializer'
import { controls } from '../../../styles'
import { css } from '../../../css'
import { useElectric } from '../../../ElectricProvider'

const optionsButtonStyle = {
  backgroundColor: 'rgba(38, 82, 37, 0)',
  border: 'none',
  color: 'white',
  '&:hover': {
    filter: 'brightness(85%)',
  },
}

const activeButtonStyle = {
  backgroundColor: 'rgba(38, 82, 37, 0)',
  color: 'white',
  '&:hover': {
    filter: 'brightness(85%)',
  },
}

const inactiveButtonStyle = {
  backgroundColor: 'rgba(38, 82, 37, 0)',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    color: 'white',
  },
}

const buildButtonStyle = ({ prevIsActive, nextIsActive, selfIsActive }) => {
  if (!selfIsActive) return inactiveButtonStyle

  const style = { ...activeButtonStyle }
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
// use overflow menu for tabs and options
export const Menu = memo(() => {
  const navigate = useNavigate()
  const params = useParams()

  const { db } = useElectric()!
  // get ui_options.tabs
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )

  const tabs = useMemo(() => results?.tabs ?? [], [results?.tabs])
  const onChangeTabs = useCallback(
    (e, { checkedItems }) => {
      db.ui_options.update({
        where: { user_id },
        data: { tabs: checkedItems },
      })
    },
    [db.ui_options],
  )

  const onClick = useCallback(() => {
    if (params.user_id) return navigate(-1)
    navigate(`/options/${user_id}`)
  }, [navigate, params])

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
      </Toolbar>
      <Button
        size="medium"
        icon={<FaCog />}
        onClick={onClick}
        title="Options"
        style={css(optionsButtonStyle)}
      />
    </div>
  )
})
