import { useState } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner, Tooltip } = fluentUiReactComponents
import { MdLogin, MdMenuBook } from 'react-icons/md'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import globalStyles from '../../../styles.module.css'
import styles from './Menu.module.css'
import { LanguageChooser } from '../../shared/LanguageChooser.tsx'
import { docsReturnUrlAtom } from '../../../store.ts'

export const Menu = () => {
  const navigate = useNavigate({ from: '/' })
  const [loading, setLoading] = useState(false)
  const intl = useIntl()
  const { pathname } = useLocation()
  const [docsReturnUrl, setDocsReturnUrl] = useAtom(docsReturnUrlAtom)
  const isInDocs = pathname.startsWith('/docs')

  const onClickEnter = () => {
    setLoading(true)
    navigate({ to: '/data/projects' })
  }

  const onClickDocs = () => {
    if (isInDocs) {
      navigate({ to: docsReturnUrl ?? '/' })
      setDocsReturnUrl(null)
    } else {
      setDocsReturnUrl(pathname)
      navigate({ to: '/docs' })
    }
  }

  const docsLabel = isInDocs
    ? intl.formatMessage({ id: 'navigationDocsGoBack', defaultMessage: 'Zurück' })
    : intl.formatMessage({ id: 'navigationDocs', defaultMessage: 'Dokumentation' })

  return (
    <div className={globalStyles.controls}>
      <LanguageChooser />
      <Tooltip content={docsLabel}>
        <Button
          size="medium"
          icon={<MdMenuBook />}
          onClick={onClickDocs}
          className={styles.button}
          aria-label={docsLabel}
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
