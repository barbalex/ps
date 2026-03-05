import { Link } from '@tanstack/react-router'
import { FormattedMessage } from 'react-intl'

import { Menu } from './Menu.tsx'
import styles from './index.module.css'

export const Header = () => (
  <div className={`${styles.container} no-print`}>
    <h1 className={styles.title}>
      <Link to="/" className={styles.link}>
        <FormattedMessage defaultMessage="Arten fördern" />
      </Link>
    </h1>
    <Menu />
  </div>
)
