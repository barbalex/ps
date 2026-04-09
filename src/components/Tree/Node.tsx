import {
  MdChevronRight as ClosedWithChildrenIcon,
  MdExpandMore as OpenWithChildrenIcon,
} from 'react-icons/md'
import { HiMiniMinusSmall as NoChildrenIcon } from 'react-icons/hi2'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { Link } from '@tanstack/react-router'
import styles from './Node.module.css'

interface Props {
  isInActiveNodeArray: boolean
  isActive: boolean
  isOpen: boolean
  level: number
  label: string | React.ReactNode
  id: string
  childrenCount: number
  to: string
  onClickButton: () => void
  sibling?: React.ReactNode
}

export const Node = ({
  isInActiveNodeArray = false,
  isActive,
  isOpen = false,
  level,
  label,
  // id is used as a backup in case the label trigger did not work
  id,
  childrenCount,
  to,
  toParams = {},
  onClickButton,
  sibling,
}: Props) => {
  // console.log('hello level:', level)

  return (
    <div
      className={`${styles.container}${isInActiveNodeArray ? ` ${styles.containerActivePath}` : ''}${isActive ? ` ${styles.containerActive}` : ''}`}
      style={{
        gridTemplateColumns: `${(level - 1) * 20 + 5}px 20px 1fr`,
      }}
    >
      <div className={styles.spacer} />
      <Button
        aria-label="toggle"
        size="small"
        appearance="transparent"
        icon={
          !childrenCount ? (
            <NoChildrenIcon className={styles.svg} />
          ) : isOpen ? (
            <OpenWithChildrenIcon className={styles.svg} />
          ) : (
            <ClosedWithChildrenIcon className={styles.svg} />
          )
        }
        onClick={onClickButton}
        disabled={!childrenCount}
        className={`${styles.toggle}${!childrenCount ? ` ${styles.toggleDisabled}` : ''}`}
      />
      <div className={styles.content}>
        {isActive ? (
          <span className={styles.contentLabel}>
            {label ?? id ?? '(missing label)'}
          </span>
        ) : (
          <Link className={styles.contentLink} to={to} params={toParams}>
            {label ?? id ?? '(missing label)'}
          </Link>
        )}
        {!!sibling && <div className={styles.contentSibling}>{sibling}</div>}
      </div>
    </div>
  )
}
