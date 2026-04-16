import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner, Tooltip } = fluentUiReactComponents
import { MdLogin, MdMenuBook } from 'react-icons/md'
import { useNavigate } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import globalStyles from '../../../styles.module.css'
import styles from './Menu.module.css'
import { LanguageChooser } from '../../shared/LanguageChooser.tsx'

export const Menu = () => {
  const navigate = useNavigate({ from: '/' })
  const [loading, setLoading] = useState(false)
  const intl = useIntl()

  const onClickEnter = () => {
    setLoading(true)
    navigate({ to: '/data/projects' })
  }

  const onClickDocs = () => navigate({ to: '/docs' })

  return (
    <div className={globalStyles.controls}>
      <LanguageChooser />
      <Tooltip
        content={intl.formatMessage({
          id: 'navigationDocs',
          defaultMessage: 'Dokumentation',
        })}
      >
        <Button
          size="medium"
          icon={<MdMenuBook />}
          onClick={onClickDocs}
          className={styles.button}
          aria-label={intl.formatMessage({
            id: 'navigationDocs',
            defaultMessage: 'Dokumentation',
          })}
        />
      </Tooltip>
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
