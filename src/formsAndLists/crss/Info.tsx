import { useIntl } from 'react-intl'

import styles from './Info.module.css'

export function Info() {
  const { formatMessage } = useIntl()

  return (
    <div className={styles.container} tabIndex={-1}>
      <p>{formatMessage({ id: 'Dx2eAf', defaultMessage: 'Dies ist eine (hoffentlich) vollständige Liste der Koordinatenreferenzsysteme.' })}</p>
      <p>{formatMessage({ id: 'Ey3fBg', defaultMessage: 'Sie können zu Projekten hinzugefügt werden.' })}</p>
    </div>
  )
}
