import { PGlite } from '@electric-sql/pglite'
import { worker } from '@electric-sql/pglite/worker'
import { electricSync } from '@electric-sql/pglite-sync'
import { postgis } from '@electric-sql/pglite-postgis'
import { live } from '@electric-sql/pglite/live'

worker({
  async init() {
    return PGlite.create('idb://ps', {
      extensions: {
        live,
        electric: electricSync(),
        postgis,
      },
      relaxedDurability: true,
      // debug: true,
    })
  },
})
