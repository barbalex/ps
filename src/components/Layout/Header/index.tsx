import { Menu } from './Menu.tsx'

import styles from './index.module.css'

export const Header = () => {
  return (
    <div className={`${styles.container} no-print`}>
      <h1 className={styles.title}>Promoting Species</h1>
      <Menu />
    </div>
  )
}
