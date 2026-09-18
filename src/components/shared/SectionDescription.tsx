import type { ReactNode } from 'react'

import styles from './SectionDescription.module.css'

type Props = {
  children: ReactNode
}

export const SectionDescription = ({ children }: Props) => (
  <p className={styles.description}>{children}</p>
)
