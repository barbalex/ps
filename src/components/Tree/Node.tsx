import {
  MdChevronRight as ClosedWithChildrenIcon,
  MdExpandMore as OpenWithChildrenIcon,
} from 'react-icons/md'
import { HiMiniMinusSmall as NoChildrenIcon } from 'react-icons/hi2'
import { Button } from '@fluentui/react-components'
import { Link } from '@tanstack/react-router'
import styles from './Node.module.css'

interface Props {
  isInActiveNodeArray: boolean
  isActive: boolean
  isOpen: boolean
  level: number
  label: string
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
      style={{
        fontWeight: isInActiveNodeArray ? 'bold' : 'normal',
        ...(isActive && { color: 'red' }),
        gridTemplateColumns: `${(level - 1) * 20 + 5}px 20px 1fr`,
      }}
      className={styles.container}
    >
      <div className={styles.spacer} />
      <Button
        aria-label="toggle"
        size="small"
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
        style={!childrenCount ? { cursor: 'default' } : undefined}
        className={styles.toggle}
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
