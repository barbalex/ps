import { memo, useCallback } from 'react'
import {
  Button,
  Toolbar,
  ToolbarToggleButton,
  ToolbarProps,
} from '@fluentui/react-components'
import { FaCog } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'

import { user_id } from '../../SqlInitializer'
import { controls, controlsButton } from '../../../styles'
import { css } from '../../../css'

// TODO:
// add buttons for tabs
// read tabs from ui_options
export const Menu = memo(() => {
  const navigate = useNavigate()
  const params = useParams()

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
        style={css(controlsButton)}
      />
    </div>
  )
})
