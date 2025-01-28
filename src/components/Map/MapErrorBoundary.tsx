import { PropsWithChildren } from 'react'
import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'
import { usePGlite } from '@electric-sql/pglite-react'

import { createNotification } from '../../modules/createRows.ts'

const onReload = () => {
  window.location.reload(true)
}

const ErrorFallback = ({ error, db, layer }) => {
  const data = createNotification({
    title: `Fehler in Vektor-Layer '${layer.label}'`,
    body: error.message,
    intent: 'error',
  })
  db.notifications.create({ data })

  return null
}

export const ErrorBoundary = ({
  children,
  layer,
})WithChildren<Props> => {
  const db = usePGlite()

  return (
    <ErrorBoundaryComponent
      FallbackComponent={({ error }) =>
        ErrorFallback({
          error,
          db,
          layer,
        })
      }
      onReset={onReload}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}
