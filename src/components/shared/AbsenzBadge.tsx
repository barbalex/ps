import { useIntl } from 'react-intl'

import styles from './AbsenzBadge.module.css'

/**
 * Red badge marking a confirmed absence (apf2: beob.absenz, stored as
 * data.absenz on the observation). Appended to observation labels.
 */
export const AbsenzBadge = () => {
  const { formatMessage } = useIntl()
  return (
    <span className={styles.badge}>
      {formatMessage({ id: 'absenzBadge', defaultMessage: 'Absenz' })}
    </span>
  )
}
