import type { ReactNode } from 'react'
import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'
import { useSetAtom } from 'jotai'

import { addNotificationAtom } from '../../store.ts'

type Layer = {
  label: string | null
}

const onReload = () => {
  // the boolean argument is no longer part of the typings
  // but is still passed through at runtime
  ;(window.location.reload as (force?: boolean) => void)(true)
}

const ErrorFallback = ({
  error,
  layer,
}: {
  error: unknown
  layer: Layer
}) => {
  const addNotification = useSetAtom(addNotificationAtom)

  addNotification({
    title: `Fehler in Vektor-Layer '${layer.label}'`,
    body: (error as Error).message,
    intent: 'error',
  })

  return null
}

export const ErrorBoundary = ({
  children,
  layer,
}: {
  children: ReactNode
  layer: Layer
}) => {
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
