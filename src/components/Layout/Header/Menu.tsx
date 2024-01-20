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

// TODO:
// add buttons for tabs
// read tabs from ui_options
export const Menu = memo(() => {
  const navigate = useNavigate()
  const params = useParams()

  const { db } = useElectric()!
  // get ui_options.tabs
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )

  const tabs = useMemo(() => results?.tabs ?? [], [results?.tabs])
  console.log('Menu, tabs:', tabs)
  const onChangeTabs = useCallback(
    (e, { checkedItems }) => {
      db.ui_options.update({
        where: { user_id },
        data: { tabs: checkedItems },
      })
    },
    [db.ui_options],
  )

  const buttonStyle = {
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

  const onClick = useCallback(() => {
    if (params.user_id) return navigate(-1)
    navigate(`/options/${user_id}`)
  }, [navigate, params])

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
          style={tabs.includes('tree') ? activeButtonStyle : buttonStyle}
        >
          Tree
        </ToolbarToggleButton>
        <ToolbarToggleButton
          aria-label="Data"
          name="tabs"
          value="data"
          style={tabs.includes('data') ? activeButtonStyle : buttonStyle}
        >
          Data
        </ToolbarToggleButton>
        <ToolbarToggleButton
          aria-label="Map"
          name="tabs"
          value="map"
          style={tabs.includes('map') ? activeButtonStyle : buttonStyle}
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
