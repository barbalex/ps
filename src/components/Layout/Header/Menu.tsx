import { Button } from '@fluentui/react-components'
import { MdLogin } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'

import globalStyles from '../../../styles.module.css'
import styles from './Menu.module.css'

export const Menu = () => {
  const navigate = useNavigate({ from: '/' })

  const onClickEnter = () => navigate({ to: '/data/projects' })

  return (
    <div className={globalStyles.controls}>
      <Button
        size="medium"
        icon={<MdLogin />}
        onClick={onClickEnter}
        title="Enter"
        className={styles.button}
      />
    </div>
  )
}
