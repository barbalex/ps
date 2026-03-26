import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

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
      style={onHeaderClick ? { cursor: 'pointer' } : undefined}
    >
      {isOpen !== undefined && (
        <span style={{ marginRight: 6, fontSize: '0.75em' }}>
          {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        </span>
      )}
      {title}
    </h2>
    {isOpen !== false && <div className={styles.children}>{children}</div>}
  </section>
)
