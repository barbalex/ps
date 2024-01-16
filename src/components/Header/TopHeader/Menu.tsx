import { memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaCog } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

import { user_id } from '../../SqlInitializer'

export const Menu = memo(() => {
  const navigate = useNavigate()

  return (
    <div className="controls">
      <Button
        size="medium"
        icon={<FaCog />}
        onClick={() => navigate(`/options/${user_id}`)}
        title="Options"
      />
    </div>
  )
})
