import type { Feature } from 'geojson'

import { postgrestClientAtom, store } from '../store.ts'
import { requirePostgrestToken } from './fetchPostgrestToken.ts'

/** Online, atomic write. Electric delivers the committed rows to all readers. */
export const importVectorFeatures = async ({
  vectorLayerId,
  features,
  mode,
}: {
  vectorLayerId: string
  features: Feature[]
  mode: 'append' | 'replace'
}): Promise<void> => {
  const token = await requirePostgrestToken()
  const client = store.get(postgrestClientAtom)
  if (!client) throw new Error('No PostgREST client available')
  const { error } = await client
    .rpc('import_vector_features', {
      p_layer_id: vectorLayerId,
      p_features: features,
      p_mode: mode,
    })
    .setHeader('Authorization', `Bearer ${token}`)
  if (error) throw Object.assign(new Error(error.message), { code: error.code })
}
