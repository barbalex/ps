import { CorbadoProvider } from '@corbado/react'

import { ElectricProvider } from '../ElectricWrapper'
import { SqlInitializer } from './SqlInitializer'
import { Syncer } from './Syncer'

import { Layout } from './LayoutProtected'

const CORBADO_PROJECT_ID = import.meta.env.ELECTRIC_CORBADO_PROJECT_ID

export const AuthAndDb = () => {
  console.log('hello AuthAndDb')

  return (
    <CorbadoProvider projectId={CORBADO_PROJECT_ID}>
      <ElectricProvider>
        <SqlInitializer />
        <Syncer />
        <Layout />
      </ElectricProvider>
    </CorbadoProvider>
  )
}
