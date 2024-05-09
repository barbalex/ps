import { useEffect, useState, memo } from 'react'
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite'
import { Electric, schema } from './generated/client/index.ts'
import { uniqueTabId } from 'electric-sql/util'
import { LIB_VERSION } from 'electric-sql/version'
import { ElectricConfig } from 'electric-sql/config'
import { useCorbado } from '@corbado/react'

import { ElectricProvider as ElectricProviderComponent } from './ElectricProvider.tsx'

import { authToken } from './auth.ts'

// https://electric-sql.com/docs/api/clients/typescript#available-options
const config: ElectricConfig = {
  // Activate debug mode which logs the replication messages
  // that are exchanged between the client and the sync service
  debug: import.meta.env.DEV,
  url: import.meta.env.ELECTRIC_SERVICE,
}

export const ElectricProvider = memo(({ children }) => {
  const [electric, setElectric] = useState<Electric>()
  const { shortSession } = useCorbado()

  // TODO: this rerenders a bit to often
  // console.log('hello ElectricProvider', {
  //   shortSession,
  //   electric,
  // })

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const { tabId } = uniqueTabId()
      const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`

      const conn = await ElectricDatabase.init(scopedDbName)
      const electric = await electrify(conn, schema, config)
      await electric.connect(authToken(shortSession))

      if (!isMounted) {
        return
      }

      setElectric(electric)
    }
    init()

    return () => {
      isMounted = false
    }
  }, [shortSession])

  if (electric === undefined) return null

  return (
    <ElectricProviderComponent db={electric}>
      {children}
    </ElectricProviderComponent>
  )
})
