import { memo, useCallback } from 'react'
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

  const tabs = results?.tabs ?? []
  console.log('Menu, tabs:', tabs)
  const onChangeTabs = useCallback(
    (e, { name, checkedItems }) => {
      console.log('onChangeTabs', { e, name, checkedItems })
      // if checkedItems[0] is not in tabs, add it
      // if checkedItems[0] is in tabs, remove it
      const checkedItem = checkedItems[0]
      const newTabs = tabs.includes(checkedItem)
        ? tabs.filter((tab) => tab !== checkedItem)
        : [...tabs, checkedItem]
      // then update ui_options.tabs
      db.ui_options.update({
        where: { user_id },
        data: { tabs: newTabs },
      })
    },
    [db.ui_options, tabs],
  )

  const onClick = useCallback(() => {
    if (params.user_id) return navigate(-1)
    navigate(`/options/${user_id}`)
  }, [navigate, params])

  return (
    <div style={controls}>
      <Toolbar
        aria-label="with controlled Toggle Button"
        checkedValues={tabs}
        onCheckedValueChange={onChangeTabs}
      >
        <ToolbarToggleButton aria-label="Bold" name="tabs" value="tree">
          Tree
        </ToolbarToggleButton>
        <ToolbarToggleButton aria-label="Italic" name="tabs" value="data">
          Data
        </ToolbarToggleButton>
        <ToolbarToggleButton aria-label="Underline" name="tabs" value="map">
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
