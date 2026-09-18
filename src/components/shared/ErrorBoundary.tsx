import {
  ErrorBoundary as ErrorBoundaryComponent,
  type FallbackProps,
} from 'react-error-boundary'

import styles from './ErrorBoundary.module.css'

// This fallback renders outside any provider (it is mounted above App in
// main.tsx), so it must not depend on Fluent or any other context.
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
      <button style={{ padding: '6px 16px' }} onClick={onReload}>neu starten</button>
    </div>
    <div className={styles.buttonContainer}>
      <button style={{ padding: '6px 16px' }} onClick={resetErrorBoundary}>
        Cache leeren und neu starten (neue Anmeldung nötig)
      </button>
    </div>
  </div>
)

export const ErrorBoundary = ({ children }: { children?: React.ReactNode }) => (
  <ErrorBoundaryComponent FallbackComponent={ErrorFallback} onReset={onReload}>
    {children}
  </ErrorBoundaryComponent>
)
