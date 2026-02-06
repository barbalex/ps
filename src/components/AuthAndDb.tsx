import { CorbadoProvider } from '@corbado/react'

import { SqlInitializer } from './SqlInitializer.tsx'
import { InitialSyncManager } from './InitialSyncManager.tsx'
// TODO: sync with db IF user has an account
import { Syncer } from './Syncer.tsx'

import { LayoutProtected } from './LayoutProtected/index.tsx'

const CORBADO_PROJECT_ID = import.meta.env.ELECTRIC_CORBADO_PROJECT_ID

export const AuthAndDb = () => {
  // console.log('AuthAndDb rendering')
  return (
    <CorbadoProvider
      projectId={CORBADO_PROJECT_ID}
      theme="corbado-theme"
    >
      <SqlInitializer />
      <InitialSyncManager />
      <Syncer />
      <LayoutProtected />
    </CorbadoProvider>
  )
}
