import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'
import { Button } from '@fluentui/react-components'

import styles from './ErrorBoundary.module.css'

const onReload = () => {
  window.location.reload(true)
}

interface Props {
  error: Error
  componentStack: string
  resetErrorBoundary: () => void
}

const ErrorFallback = ({
  error,
  componentStack,
  resetErrorBoundary,
}: Props) => (
  <div className={styles.container}>
    <p>Sorry, ein Fehler ist aufgetreten:</p>
    <pre className={styles.preWrapping}>{error.message}</pre>
    <details className={styles.details}>
      <summary className={styles.summary}>Mehr Informationen</summary>
      <pre className={styles.pre}>{componentStack}</pre>
    </details>
    <div className={styles.buttonContainer}>
      <Button appearance="primary" onClick={onReload}>
        neu starten
      </Button>
    </div>
    <div className={styles.buttonContainer}>
      <Button appearance="secondary" onClick={resetErrorBoundary}>
        Cache leeren und neu starten (neue Anmeldung nötig)
      </Button>
    </div>
  </div>
)

export const ErrorBoundary = ({ children }) => (
  <ErrorBoundaryComponent FallbackComponent={ErrorFallback} onReset={onReload}>
    {children}
  </ErrorBoundaryComponent>
)
