import { useIntl } from 'react-intl'

import styles from './Info.module.css'

export const Info = () => {
  const { formatMessage } = useIntl()

  return (
    <div className={styles.container} tabIndex={-1}>
      <p>
        {formatMessage(
          {
            id: 'Ac1BdE',
            defaultMessage:
              'Du kannst mehrere <b>K</b>oordinaten-<b>B</b>ezugs-<b>S</b>ysteme hinzufügen.',
          },
          { b: (chunks) => <strong>{chunks}</strong> },
        )}
      </p>
      <p>
        {formatMessage({
          id: 'Kn3OpQ',
          defaultMessage:
            'Eines davon wird verwendet, um Koordinaten in der Karte anzuzeigen.',
        })}
      </p>
      <p>
        {formatMessage({
          id: 'Ru4StV',
          defaultMessage:
            'Benutzer können in der Karte eines der hier hinzugefügten KBS auswählen.',
        })}
      </p>
      <p>
        {formatMessage({
          id: 'Wx5YzA',
          defaultMessage:
            'Wenn kein KBS ausgewählt ist, wird standardmässig WGS84 verwendet.',
        })}
      </p>
    </div>
  )
}
