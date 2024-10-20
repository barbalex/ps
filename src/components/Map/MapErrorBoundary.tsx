import { PropsWithChildren } from 'react'
import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'

import { Wms_layers as WmsLayer } from '../../../generated/client/index.ts'
import { useElectric } from '../../ElectricProvider.tsx'
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

interface Props {
  layer: WmsLayer
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
