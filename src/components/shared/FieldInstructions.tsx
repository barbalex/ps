import type { ReactNode } from 'react'
import styles from './FieldInstructions.module.css'

export function FieldInstructions({
  text,
  children,
}: {
  text: string | null
  children: ReactNode
}) {
  return text ?
      <div
        role="group"
        aria-description={text}
      >
        {children}
        <p className={styles.instructions}>{text}</p>
      </div>
    : children
}
