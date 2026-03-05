import styles from './Preview.module.css'

export const Preview = ({ observations, observationFields }) => {
  if (!observations) {
    return <div className={styles.emptyContainer}>loading preview...</div>
  }
  if (!observations.length) {
    return <div className={styles.emptyContainer}>no data to preview</div>
  }
  const observationFieldsWithLabel = ['label', ...observationFields]

  return (
    <div className={styles.container}>
      <table
        aria-label="Preview"
        className={styles.table}
        width={observationFieldsWithLabel.length * 60}
      >
        <thead className={styles.head}>
          <tr>
            {observationFieldsWithLabel.map((f) => (
              <th key={f} className={styles.headerCell}>
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {observations.slice(0, 50).map((o) => (
            <tr key={o.observation_id}>
              {observationFieldsWithLabel.map((f, i) => (
                <td key={f} className={styles.bodyCell}>
                  {f === 'label' && i === 0 ? o.label : o.data[f]}
                </td>
              ))}
            </tr>
          ))}
          {observations.length > 50 && (
            <tr>
              <td
                colSpan={observationFieldsWithLabel.length}
                className={styles.bodyCell}
              >
                and {observations.length - 50} more rows...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
