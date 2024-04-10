import { CorbadoProvider } from '@corbado/react'
import { useSearchParams } from 'react-router-dom'

import { ElectricWrapper as ElectricProvider } from '../ElectricWrapper'
import { ProtectedRoute } from './ProtectedRoute'
import { SqlInitializer } from './SqlInitializer'
import { Syncer } from './Syncer'

import { Breadcrumbs } from './Layout/Breadcrumbs'
import { Navs } from './Layout/Navs'
import { Main } from './Layout/Main'
import { Notifications } from './Notifications'
const CORBADO_PROJECT_ID = import.meta.env.ELECTRIC_CORBADO_PROJECT_ID

export const AuthAndDb = () => {
  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')

  return (
    <CorbadoProvider projectId={CORBADO_PROJECT_ID}>
      <ElectricProvider>
        <SqlInitializer />
        <Syncer />
        <ProtectedRoute>
          {onlyForm ? (
            <Main />
          ) : (
            <>
              <Breadcrumbs />
              <Navs />
              <Main />
              <Notifications />
            </>
          )}
        </ProtectedRoute>
      </ElectricProvider>
    </CorbadoProvider>
  )
}
