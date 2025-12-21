import { Link } from '@tanstack/react-router'

import { Menu } from './Menu.tsx'
import styles from './index.module.css'

export const Header = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>
      <Link
        to="/"
        className={styles.link}
      >
        Promoting Species
      </Link>
    </h1>
    <Menu />
  </div>
)
