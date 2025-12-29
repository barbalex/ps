import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Header } from '../components/Layout/Header/index.tsx'
import styles from './_layout.module.css'

export const Route = createFileRoute('/_layout')({
  component: Component,
})

function Component() {
  return (
    <>
      <Header />
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </>
  )
}
