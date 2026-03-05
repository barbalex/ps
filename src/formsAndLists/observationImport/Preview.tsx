import styles from './Preview.module.css'

export const Preview = ({ occurrences, occurrenceFields }) => {
  if (!occurrences) {
    return <div className={styles.emptyContainer}>loading preview...</div>
  }
  if (!occurrences.length) {
    return <div className={styles.emptyContainer}>no data to preview</div>
  }
  const occurrenceFieldsWithLabel = ['label', ...occurrenceFields]

  return (
    <div className={styles.container}>
      <table
        aria-label="Preview"
        className={styles.table}
        width={occurrenceFieldsWithLabel.length * 60}
      >
        <thead className={styles.head}>
          <tr>
            {occurrenceFieldsWithLabel.map((f) => (
              <th key={f} className={styles.headerCell}>
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {occurrences.slice(0, 50).map((o) => (
            <tr key={o.occurrence_id}>
              {occurrenceFieldsWithLabel.map((f, i) => (
                <td key={f} className={styles.bodyCell}>
                  {f === 'label' && i === 0 ? o.label : o.data[f]}
                </td>
              ))}
            </tr>
          ))}
          {occurrences.length > 50 && (
            <tr>
              <td
                colSpan={occurrenceFieldsWithLabel.length}
                className={styles.bodyCell}
              >
                and {occurrences.length - 50} more rows...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
