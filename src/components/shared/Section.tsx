import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

import styles from './Section.module.css'

// need to place children under their own parent
// because some have position: relative which makes them overlay the section title
export const Section = ({
  title,
  children,
  onHeaderClick = undefined,
  isOpen = undefined,
}) => (
  <section>
    <h2
      className={styles.title}
      onClick={onHeaderClick}
      style={
        onHeaderClick
          ? {
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }
          : undefined
      }
    >
      {title}
      {isOpen !== undefined && (
        <span style={{ fontSize: '1em' }}>
          {isOpen ? <FaChevronDown /> : <FaChevronUp />}
        </span>
      )}
    </h2>
    {isOpen !== false && <div className={styles.children}>{children}</div>}
  </section>
)
