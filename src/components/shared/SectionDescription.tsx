import styles from './SectionDescription.module.css'

export const SectionDescription = ({ children, marginTop = 0 }) => (
  <p className={styles.description} style={{ marginTop }}>
    {children}
  </p>
)
