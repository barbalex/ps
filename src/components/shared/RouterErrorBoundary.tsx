// from the individual package, not the @fluentui/react-components barrel:
// any import from the barrel keeps re-export bindings to every fluent
// package alive, pulling the whole suite into the eager entry chunk (this
// is the router's default error component)
import { Button } from '@fluentui/react-button'

import styles from './RouterErrorBoundary.module.css'

const onReload = () => {
  window.location.reload()
}

// Wipes the local PGlite database. Deletion requests that are blocked by the
// still-running db worker complete when the worker dies on reload; the next
// boot then starts from a fresh database (and a fresh sign-in).
// see ErrorBoundary.tsx: dynamic import keeps @electric-sql out of the
// eager entry chunk
const onReloadWithCacheClear = async () => {
  try {
    const { deleteIdbDatabases } =
      await import('../../modules/ensurePgliteDb.ts')
    await deleteIdbDatabases()
  } catch {
    // reload anyway — a partial delete still beats a no-op
  }
  window.location.reload()
}

interface Props {
  error: Error
}

export const RouterErrorBoundary = ({ error }: Props) => (
  <div className={styles.container}>
    <p>Sorry, ein Fehler ist aufgetreten:</p>
    <pre className={styles.preWrapping}>{error.message}</pre>
    <div className={styles.buttonContainer}>
      <Button
        appearance="primary"
        onClick={onReload}
      >
        neu starten
      </Button>
    </div>
    <div className={styles.buttonContainer}>
      <Button
        appearance="secondary"
        onClick={onReloadWithCacheClear}
      >
        Cache leeren und neu starten (neue Anmeldung nötig)
      </Button>
    </div>
  </div>
)
