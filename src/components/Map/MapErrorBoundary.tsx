import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'
import { useSetAtom } from 'jotai'

import { addNotificationAtom } from '../../store.ts'

const onReload = () => {
  window.location.reload(true)
}

const ErrorFallback = ({ error, layer }) => {
  const addNotification = useSetAtom(addNotificationAtom)

  addNotification({
    title: `Fehler in Vektor-Layer '${layer.label}'`,
    body: error.message,
    intent: 'error',
  })

  return null
}

export const ErrorBoundary = ({ children, layer }) => {
  return (
    <ErrorBoundaryComponent
      FallbackComponent={({ error }) =>
        ErrorFallback({
          error,
          layer,
        })
      }
      onReset={onReload}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}
