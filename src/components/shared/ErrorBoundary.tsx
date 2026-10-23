import {
  ErrorBoundary as ErrorBoundaryComponent,
  type FallbackProps,
} from 'react-error-boundary'

import styles from './ErrorBoundary.module.css'
import { deleteIdbDatabases } from '../../modules/ensurePgliteDb.ts'

// This fallback renders outside any provider (it is mounted above App in
// main.tsx), so it must not depend on Fluent or any other context.
const onReload = () => {
  window.location.reload()
}

// Wipes the local PGlite database. Deletion requests that are blocked by the
// still-running db worker complete when the worker dies on reload; the next
// boot then starts from a fresh database (and a fresh sign-in).
const onReloadWithCacheClear = async () => {
  try {
    await deleteIdbDatabases()
  } catch {
    // reload anyway — a partial delete still beats a no-op
  }
  window.location.reload()
}

interface Props extends FallbackProps {
  componentStack?: string
}

const ErrorFallback = ({ error, componentStack }: Props) => (
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
      <button style={{ padding: '6px 16px' }} onClick={onReloadWithCacheClear}>
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
