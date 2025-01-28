import { memo } from 'react'
import { CorbadoProvider } from '@corbado/react'
import { usePGlite } from '@electric-sql/pglite-react'

import { SqlInitializer } from './SqlInitializer/index.tsx'
import { Syncer } from './Syncer.tsx'
import { TreeOpenNodesSetter } from './TreeOpenNodesSetter.tsx'

import { Layout } from './LayoutProtected/index.tsx'

const CORBADO_PROJECT_ID = import.meta.env.ELECTRIC_CORBADO_PROJECT_ID

export const AuthAndDb = memo(() => {
  const db = usePGlite()
  console.log('AuthAndDb', { db })
  return (
    <CorbadoProvider
      projectId={CORBADO_PROJECT_ID}
      theme="corbado-theme"
    >
        <SqlInitializer />
        <Syncer />
        <TreeOpenNodesSetter />
        <Layout />
    </CorbadoProvider>
  )
})
