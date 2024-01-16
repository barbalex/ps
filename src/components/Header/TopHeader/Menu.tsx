import { memo, useCallback } from 'react'
import { Button } from '@fluentui/react-components'
import { FaCog } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'

import { user_id } from '../../SqlInitializer'

export const Menu = memo(() => {
  const navigate = useNavigate()
  const params = useParams()

  const onClick = useCallback(() => {
    if (params.user_id) return navigate(-1)
    navigate(`/options/${user_id}`)
  }, [navigate, params])

  return (
    <div className="controls">
      <Button
        size="medium"
        icon={<FaCog />}
        onClick={onClick}
        title="Options"
      />
    </div>
  )
})
