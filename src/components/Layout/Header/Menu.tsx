import { memo, useCallback } from 'react'
import {
  Button,
  Toolbar,
  ToolbarToggleButton,
  ToolbarProps,
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

  const tabs = results?.tabs
  console.log('Menu, tabs:', tabs)

  const onClick = useCallback(() => {
    if (params.user_id) return navigate(-1)
    navigate(`/options/${user_id}`)
  }, [navigate, params])

  return (
    <div style={controls}>
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
