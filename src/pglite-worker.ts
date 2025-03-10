import { PGlite } from '@electric-sql/pglite'
import { worker } from '@electric-sql/pglite/worker'

worker({
  async init() {
    return new PGlite({
      dataDir: 'idb://ps',
      debug: true,
      relaxedDurability: true,
    })
  },
})
