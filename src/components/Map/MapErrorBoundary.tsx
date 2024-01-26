import { PropsWithChildren } from 'react'
import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'

import { TileLayer } from '../../dexieClient'
import { useElectric } from '../../ElectricProvider'
import { user_id } from '../SqlInitializer'

const onReload = () => {
  window.location.reload(true)
}

const ErrorFallback = ({ error, db, layer, notifications }) => {
  const layerName =
    layer._layerOptions.find((o) => o.value === layer.type_name)?.label ??
    layer.type_name

  db.ui_options.update({
    where: { user_id },
    data: {
      notifications: [
        {
          title: `Fehler in Vektor-Layer '${layerName}'`,
          body: error.message,
          intent: 'error', // 'success' | 'error' | 'warning' | 'info'
        },
        ...notifications,
      ],
    },
  })

  return null
}

interface Props {
  layer: TileLayer
}

export const ErrorBoundary = ({
  children,
  layer,
}): PropsWithChildren<Props> => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const notifications = uiOption?.notifications ?? []

  return (
    <ErrorBoundaryComponent
      FallbackComponent={({ error, componentStack, resetErrorBoundary }) =>
        ErrorFallback({
          error,
          componentStack,
          resetErrorBoundary,
          db,
          layer,
          notifications,
        })
      }
      onReset={onReload}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}
