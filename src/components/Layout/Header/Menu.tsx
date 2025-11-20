import { Button } from '@fluentui/react-components'
import { MdLogin } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { pipe } from 'remeda'

import { controls } from '../../../styles.ts'
import { on } from '../../../css.ts'

export const Menu = () => {
  const navigate = useNavigate({ from: '/' })

  const onClickEnter = () => navigate({ to: '/data/projects' })

  return (
    <div style={controls}>
      <Button
        size="medium"
        icon={<MdLogin />}
        onClick={onClickEnter}
        title="Enter"
        style={pipe(
          {
            backgroundColor: 'rgba(38, 82, 37, 0)',
            border: 'none',
            color: 'white',
          },
          on('&:hover', { filter: 'brightness(85%)' }),
        )}
      />
    </div>
  )
}
