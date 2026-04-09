import type { ReactNode } from 'react'

import styles from './index.module.css'

export type HistoryValueListItem = {
  key: string
  label: ReactNode
  value: ReactNode
  isDifferent?: boolean
}

export const HistoryValueListScroller = ({
  children,
  padded = false,
}: {
  children: ReactNode
  padded?: boolean
}) => (
  <div className={styles.valueListScrollerWrap}>
    <div
      className={`${styles.valueListScroller}${padded ? ` ${styles.valueListScrollerPadded}` : ''}`}
    >
      {children}
    </div>
  </div>
)

export const HistoryValueList = ({
  items,
}: {
  items: HistoryValueListItem[]
}) => (
  <dl className={styles.valueList}>
    {items.map((item, index) => {
      const isLast = index === items.length - 1

      return (
        <div key={item.key} className={styles.group}>
          <dt
            className={`${styles.label}${isLast ? ` ${styles.noBorder}` : ''}`}
          >
            {item.label}
          </dt>
          <dd
            className={`${styles.value}${item.isDifferent ? ` ${styles.valueRed}` : ''}${isLast ? ` ${styles.noBorder}` : ''}`}
          >
            {item.value}
          </dd>
        </div>
      )
    })}
  </dl>
)
