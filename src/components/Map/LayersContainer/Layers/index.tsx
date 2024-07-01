import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'

export const Layers = memo(({ isNarrow }) => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  // query all active layers - tile or vector
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  return (
    <ErrorBoundary>
      <div
        style={{
          width: '100%',
          ...(isNarrow ? { marginTop: 5 } : { marginRight: 5 }),
        }}
      >
        <FormHeader
          title="Layers"
          titleMarginLeft={isNarrow ? 34 : undefined}
        />
        layers
      </div>
    </ErrorBoundary>
  )
})
