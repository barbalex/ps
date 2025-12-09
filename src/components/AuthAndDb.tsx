import { Suspense } from 'react'
import { CorbadoProvider } from '@corbado/react'

import { SqlInitializer } from './SqlInitializer/index.tsx'
// TODO: sync with db IF user has an account
import { Syncer } from './Syncer.tsx'
import { TreeOpenNodesSetter } from './TreeOpenNodesSetter.tsx'
import { PostgrestClientInitator } from './PostgrestClientInitator.tsx'
import { ApiDetector } from './ApiDetector.tsx'

import { Layout } from './LayoutProtected/index.tsx'

const CORBADO_PROJECT_ID = import.meta.env.ELECTRIC_CORBADO_PROJECT_ID

export const AuthAndDb = () => {
  // console.log('AuthAndDb rendering')
  return (
    <CorbadoProvider
      projectId={CORBADO_PROJECT_ID}
      theme="corbado-theme"
    >
      <Suspense fallback="loading...">
        <SqlInitializer />
      </Suspense>
      <PostgrestClientInitator />
      <ApiDetector />
      <Syncer />
      <TreeOpenNodesSetter />
      <Layout />
    </CorbadoProvider>
  )
}
