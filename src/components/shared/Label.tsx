import styles from './Label.module.css'

// TODO: use fluent ui label
export const Label = ({ label }: { label: string }) => (
  <div className={styles.label}>{label}</div>
)
