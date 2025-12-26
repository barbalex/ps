import styles from './Container.module.css'

export const Container = ({ children, layer, isLast }) => (
  <section
    style={isLast ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' } : {}}
    className={styles.section}
  >
    <div className={styles.title}>{layer.label}</div>
    {children}
  </section>
)
