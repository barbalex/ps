import { PropsWithChildren } from 'react'
import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'

import { TileLayer } from '../../dexieClient'
import { useElectric } from '../../ElectricProvider'
import { createNotification } from '../../modules/createRows'

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
