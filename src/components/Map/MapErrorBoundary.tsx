import { PropsWithChildren } from 'react'
import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'
import { uuidv7 } from '@kripod/uuidv7'

import { TileLayer } from '../../dexieClient'
import { useElectric } from '../../ElectricProvider'

const onReload = () => {
  window.location.reload(true)
}

const ErrorFallback = ({ error, db, layer }) => {
  const layerName =
    layer._layerOptions.find((o) => o.value === layer.type_name)?.label ??
    layer.type_name

  db.notifications.create({
    title: `Fehler in Vektor-Layer '${layerName}'`,
    body: error.message,
    intent: 'error', // 'success' | 'error' | 'warning' | 'info'
    notification_id: uuidv7(),
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
