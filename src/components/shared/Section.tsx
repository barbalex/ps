import styles from './Section.module.css'

// need to place children under their own parent
// because some have position: relative which makes them overlay the section title
export const Section = ({ title, children, onHeaderClick = undefined }) => (
  <section>
    <h2
      className={styles.title}
      onClick={onHeaderClick}
      style={onHeaderClick ? { cursor: 'pointer' } : undefined}
    >
      {title}
    </h2>
    <div className={styles.children}>{children}</div>
  </section>
)
