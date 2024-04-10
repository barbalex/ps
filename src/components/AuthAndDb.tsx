import { CorbadoProvider } from '@corbado/react'

import { ElectricWrapper as ElectricProvider } from '../ElectricWrapper'
import { ProtectedRoute } from './ProtectedRoute'
import { SqlInitializer } from './SqlInitializer'
import { Syncer } from './Syncer'

import { Layout } from './LayoutProtected'

const CORBADO_PROJECT_ID = import.meta.env.ELECTRIC_CORBADO_PROJECT_ID

export const AuthAndDb = () => (
  <CorbadoProvider projectId={CORBADO_PROJECT_ID}>
    <ElectricProvider>
      <SqlInitializer />
      <Syncer />
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    </ElectricProvider>
  </CorbadoProvider>
)
