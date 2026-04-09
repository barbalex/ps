import { FaChevronDown } from 'react-icons/fa'

import styles from './SectionLevel2.module.css'

export const SectionLevel2 = ({
  title,
  children,
  onHeaderClick = undefined,
  onNavigate = undefined,
  isOpen = undefined,
  headerActions = undefined,
}) => (
  <section>
    <h3
      className={`${styles.title}${onHeaderClick || onNavigate ? ` ${styles.titleClickable}` : ''}`}
      onClick={onNavigate ?? onHeaderClick}
    >
      {title}
      {(headerActions || isOpen !== undefined) && (
        <span
          className={styles.headerActions}
          onClick={(e) => e.stopPropagation()}
        >
          {headerActions}
          {isOpen !== undefined && (
            <span
              className={styles.toggleButton}
              onClick={() => onHeaderClick?.()}
            >
              <FaChevronDown
                className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ''}`}
              />
            </span>
          )}
        </span>
      )}
    </h3>
    {isOpen !== false && (
      <div
        className={`${styles.children}${isOpen ? ` ${styles.childrenOpen}` : ''}`}
      >
        {children}
      </div>
    )}
  </section>
)
