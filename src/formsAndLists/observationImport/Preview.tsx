import { useIntl } from 'react-intl'
import styles from './Preview.module.css'

export const Preview = ({ observations, observationFields }) => {
  const { formatMessage } = useIntl()
  if (!observations) {
    return <div className={styles.emptyContainer}>{formatMessage({ id: 'lPrW0d', defaultMessage: 'Vorschau wird geladen...' })}</div>
  }
  if (!observations.length) {
    return <div className={styles.emptyContainer}>{formatMessage({ id: 'nDt0Pr', defaultMessage: 'Keine Daten für die Vorschau' })}</div>
  }
  const observationFieldsWithLabel = ['label', ...observationFields]

  return (
    <div className={styles.container}>
      <table
        aria-label={formatMessage({ id: 'prVw0A', defaultMessage: 'Vorschau' })}
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
                {formatMessage({ id: 'mRw0sX', defaultMessage: 'und {count} weitere Zeilen...' }, { count: observations.length - 50 })}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
