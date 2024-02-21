import { useEffect, useState } from 'react'

import { insecureAuthToken } from 'electric-sql/auth'
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite'
import { LIB_VERSION } from 'electric-sql/version'
import { uniqueTabId } from 'electric-sql/util'

// import { authToken } from './auth'
import { Electric, schema } from './generated/client'
import { ElectricProvider } from './ElectricProvider'

export const ElectricWrapper = ({ children }) => {
  const [electric, setElectric] = useState<Electric>()

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const config = {
        auth: {
          clientId: 'dummy client id',
        },
      }
      const { tabId } = uniqueTabId()
      const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`
      const conn = await ElectricDatabase.init(scopedDbName, '')
      const electric = await electrify(conn, schema, config)
      const token = insecureAuthToken({ user_id: 'dummy' })
      await electric.connect(token)

      if (!isMounted) {
        return
      }

      setElectric(electric)
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  if (electric === undefined) {
    return null
  }

  return <ElectricProvider db={electric}>{children}</ElectricProvider>
}
