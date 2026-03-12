import styles from './SectionDescription.module.css'

export const SectionDescription = ({ children }) => (
  <p className={styles.description}>{children}</p>
)
