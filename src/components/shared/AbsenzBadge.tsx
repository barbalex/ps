import { useIntl } from 'react-intl'

import styles from './AbsenzBadge.module.css'

/**
 * Red badge marking a confirmed absence (observations.absence, set by the
 * import's absence rule or manually in the form). Appended to observation
 * labels.
 */
export const AbsenzBadge = () => {
  const { formatMessage } = useIntl()
  return (
    <span className={styles.badge}>
      {formatMessage({ id: 'absenzBadge', defaultMessage: 'Absenz' })}
    </span>
  )
}
