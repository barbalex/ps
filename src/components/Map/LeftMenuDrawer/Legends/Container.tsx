import styles from './Container.module.css'

export const Container = ({ children, layer, isLast }) => (
  <section
    className={`${styles.section}${isLast ? ` ${styles.sectionLast}` : ''}`}
  >
    <div className={styles.title}>{layer.label}</div>
    {children}
  </section>
)
