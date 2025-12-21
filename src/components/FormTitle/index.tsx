import styles from './index.module.css'

export const FormTitle = ({ title, MenuComponent = null, menuProps = {} }) => (
  <div className={styles.container}>
    <div className={styles.titleRow}>
      <div className={styles.title}>{title}</div>
      {!!MenuComponent && (
        <MenuComponent
          toggleFilterInput={toggleFilterInput}
          {...menuProps}
        />
      )}
    </div>
  </div>
)
