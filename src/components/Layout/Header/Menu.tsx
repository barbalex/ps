import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner } = fluentUiReactComponents
import { MdLogin } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'

import globalStyles from '../../../styles.module.css'
import styles from './Menu.module.css'
import { LanguageChooser } from '../../shared/LanguageChooser.tsx'

export const Menu = () => {
  const navigate = useNavigate({ from: '/' })
  const [loading, setLoading] = useState(false)

  const onClickEnter = () => {
    setLoading(true)
    navigate({ to: '/data/projects' })
  }

  return (
    <div className={globalStyles.controls}>
      <LanguageChooser />
      <Button
        size="medium"
        icon={loading ? <Spinner size="tiny" /> : <MdLogin />}
        onClick={onClickEnter}
        disabled={loading}
        title="Enter"
        className={styles.button}
      />
    </div>
  )
}
