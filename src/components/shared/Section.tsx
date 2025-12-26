import styles from './Section.module.css'

// need to place children under their own parent
// because some have position: relative which makes them overlay the section title
export const Section = ({ title, children }) => (
  <section>
    <h2 className={styles.title}>{title}</h2>
    {children}
  </section>
)
