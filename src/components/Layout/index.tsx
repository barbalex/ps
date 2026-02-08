import { Outlet } from '@tanstack/react-router'

import { Header } from './Header/index.tsx'
import { BackgroundTasks } from '../BackgroundTasks/index.tsx'
import styles from './index.module.css'

export const Layout = () => (
  <>
    <Header />
    <div className={styles.outletContainer}>
      <Outlet />
    </div>
    <BackgroundTasks />
  </>
)
