import { PGlite } from '@electric-sql/pglite'
import { worker } from '@electric-sql/pglite/worker'
import { electricSync } from '@electric-sql/pglite-sync'
import { postgis } from '@electric-sql/pglite-postgis'
import { live } from '@electric-sql/pglite/live'
import { pg_uuidv7 } from '@electric-sql/pglite-pg_uuidv7'

worker({
  async init() {
    return PGlite.create('idb://ps', {
      extensions: {
        live,
        electric: electricSync(),
        postgis,
        pg_uuidv7,
      },
      relaxedDurability: true,
      // debug: true,
    })
  },
})
