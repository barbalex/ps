import { Button } from '@fluentui/react-components'

import styles from './RouterErrorBoundary.module.css'

const onReload = () => {
  window.location.reload(true)
}

interface Props {
  error: Error
}

// TODO: empty cache for second button
export const RouterErrorBoundary = ({ error }: Props) => (
  <div className={styles.container}>
    <p>Sorry, ein Fehler ist aufgetreten:</p>
    <pre className={styles.preWrapping}>{error.message}</pre>
    <div className={styles.buttonContainer}>
      <Button appearance="primary" onClick={onReload}>
        neu starten
      </Button>
    </div>
    <div className={styles.buttonContainer}>
      <Button appearance="secondary" onClick={onReload}>
        Cache leeren und neu starten (neue Anmeldung nötig)
      </Button>
    </div>
  </div>
)
