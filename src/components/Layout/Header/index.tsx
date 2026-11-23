import { Link } from '@tanstack/react-router'
import { FormattedMessage, useIntl } from 'react-intl'

import { MdHome } from '../../shared/mdIcons.ts'
import { Menu } from './Menu.tsx'
import styles from './index.module.css'

export const Header = () => {
  const intl = useIntl()
  const homeLabel = intl.formatMessage({
    id: 'navigationHome',
    defaultMessage: 'Home',
  })

  return (
    <div className={`${styles.container} no-print`}>
      <div className={styles.left}>
        <Link
          to="/"
          className={styles.homeLink}
          title={homeLabel}
          aria-label={homeLabel}
        >
          <MdHome />
        </Link>
        <h1 className={styles.title}>
          <Link
            to="/"
            className={styles.link}
          >
            <FormattedMessage defaultMessage="Arten fördern" />
          </Link>
        </h1>
      </div>
      <Menu />
    </div>
  )
}
