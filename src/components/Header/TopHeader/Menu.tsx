import { memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaCog } from 'react-icons/fa'

export const Menu = memo(() => (
  <div className="controls">
    <Button
      size="medium"
      icon={<FaCog />}
      onClick={() => console.log('TODO:')}
      title="Options"
    />
  </div>
))
