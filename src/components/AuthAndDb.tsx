import { memo } from 'react'
import { CorbadoProvider } from '@corbado/react'

import { ElectricProvider } from '../ElectricWrapper.tsx'
import { SqlInitializer } from './SqlInitializer/index.tsx'
import { Syncer } from './Syncer.tsx'

import { Layout } from './LayoutProtected/index.tsx'

const CORBADO_PROJECT_ID = import.meta.env.ELECTRIC_CORBADO_PROJECT_ID

export const AuthAndDb = memo(() => {
  // console.log('hello AuthAndDb')

  return (
    <CorbadoProvider projectId={CORBADO_PROJECT_ID} theme="corbado-theme">
      <ElectricProvider>
        <SqlInitializer />
        <Syncer />
        <Layout />
      </ElectricProvider>
    </CorbadoProvider>
  )
})
