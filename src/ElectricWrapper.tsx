// wrapper.tsx
import React, { ReactNode, useEffect, useState } from 'react'
import { insecureAuthToken } from 'electric-sql/auth'
import { makeElectricContext } from 'electric-sql/react'
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite'
import { Electric, schema } from './generated/client'
import { genUUID, uniqueTabId } from 'electric-sql/util'
import { LIB_VERSION } from 'electric-sql/version'

const { ElectricProvider, useElectric } = makeElectricContext<Electric>()

import { authToken } from './auth'

export const ElectricWrapper = ({ children }) => {
  const [electric, setElectric] = useState<Electric>()

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const config = {
        debug: import.meta.env.DEV,
        url: import.meta.env.ELECTRIC_SERVICE,
      }

      const { tabId } = uniqueTabId()
      const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`

      const conn = await ElectricDatabase.init(scopedDbName)
      const electric = await electrify(conn, schema, config)
      await electric.connect(authToken())

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
