import { memo, useCallback } from 'react'
import { Button } from '@fluentui/react-components'
import { MdLogin } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

import { controls } from '../../../styles'
import { css } from '../../../css'

// TODO:
// use overflow menu for tabs and app-state
export const Menu = memo(() => {
  const navigate = useNavigate()

  const onClickEnter = useCallback(() => navigate('/projects'), [navigate])

  return (
    <div style={controls}>
      <Button
        size="medium"
        icon={<MdLogin />}
        onClick={onClickEnter}
        title={'Enter'}
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
