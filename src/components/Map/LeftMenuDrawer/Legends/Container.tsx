import type { ReactNode } from 'react'

import styles from './Container.module.css'

export const Container = ({
  children,
  layer,
  isLast,
}: {
  children: ReactNode
  layer: { label?: string | null }
  isLast: boolean
}) => (
  <section
    className={`${styles.section}${isLast ? ` ${styles.sectionLast}` : ''}`}
  >
    <div className={styles.title}>{layer.label}</div>
    {children}
  </section>
)
