import { useIntl } from 'react-intl'

import styles from './Info.module.css'

export const Info = () => {
  const { formatMessage } = useIntl()

  return (
    <div className={styles.container} tabIndex={-1}>
      <p>
        {formatMessage({
          id: 'Ac1BdE',
          defaultMessage: 'Sie können mehrere CRS hinzufügen.',
        })}
      </p>
      <p>
        {formatMessage({
          id: 'Fh2GiJ',
          defaultMessage:
            'Eines davon kann als Darstellungs-CRS der Karte festgelegt werden.',
        })}
      </p>
      <p>
        {formatMessage({
          id: 'Kn3OpQ',
          defaultMessage:
            'Es wird verwendet, um Koordinaten in der Karte anzuzeigen.',
        })}
      </p>
      <p>
        {formatMessage({
          id: 'Ru4StV',
          defaultMessage:
            'Benutzer können in der Karte eines der hier hinzugefügten CRS auswählen.',
        })}
      </p>
      <p>
        {formatMessage({
          id: 'Wx5YzA',
          defaultMessage:
            'Wenn kein CRS ausgewählt ist, wird standardmäßig WGS84 verwendet.',
        })}
      </p>
    </div>
  )
}
