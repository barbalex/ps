import type { ComponentType, ReactNode } from 'react'

import styles from './index.module.css'

interface Props {
  title?: ReactNode
  MenuComponent?: ComponentType<Record<string, unknown>> | null
  menuProps?: Record<string, unknown>
}

// ambient declaration: this identifier is referenced below but not defined in
// this module (the component is currently unused)
declare const toggleFilterInput: (() => void) | undefined

export const FormTitle = ({
  title,
  MenuComponent = null,
  menuProps = {},
}: Props) => (
  <div className={styles.container}>
    <div className={styles.titleRow}>
      <div className={styles.title}>{title}</div>
      {!!MenuComponent && (
        <MenuComponent
          toggleFilterInput={toggleFilterInput}
          {...menuProps}
        />
      )}
    </div>
  </div>
)
