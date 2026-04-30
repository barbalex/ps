import { useIntl } from 'react-intl'

import styles from './Info.module.css'

export function Info() {
  const { formatMessage } = useIntl()

  return (
    <div className={styles.container} tabIndex={-1}>
      <p>
        {formatMessage({
          id: 'qcs.info',
          defaultMessage:
            'Das hier sind vordefinierte Qualitätskontrollen. Sie sind in jedem Projekt verfügbar. Sie können auf Ebene Projekt oder Teil-Projekt angewendet werden. Im Projekt kannst du eigene Qualitätskontrollen erstellen, die nur in diesem Projekt und seinen Teil-Projekten verfügbar sind.',
        })}
      </p>
    </div>
  )
}
