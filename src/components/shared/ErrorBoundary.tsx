import {
  ErrorBoundary as ErrorBoundaryComponent,
  type FallbackProps,
} from 'react-error-boundary'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents

import styles from './ErrorBoundary.module.css'

const onReload = () => {
  window.location.reload()
}

interface Props extends FallbackProps {
  componentStack?: string
}

const ErrorFallback = ({
  error,
  componentStack,
  resetErrorBoundary,
}: Props) => (
  <div className={styles.container}>
    <p>Sorry, ein Fehler ist aufgetreten:</p>
    <pre className={styles.preWrapping}>{(error as Error).message}</pre>
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

export const ErrorBoundary = ({ children }: { children?: React.ReactNode }) => (
  <ErrorBoundaryComponent FallbackComponent={ErrorFallback} onReset={onReload}>
    {children}
  </ErrorBoundaryComponent>
)
