import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { useDebounce } from 'use-debounce'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { mapViewportBoundsAtom } from '../../../../store.ts'
import {
  viewportParams,
  VIEWPORT_ENVELOPE_DEBOUNCE_MS,
} from '../viewportEnvelope.ts'
import {
  uploadFeature,
  uploadFeaturesSql,
  type UploadRow,
} from './uploadFeatures.ts'
import type { VectorProps } from './index.tsx'
import { VectorFeatures } from './VectorFeatures.tsx'

export const Upload = (props: VectorProps) => {
  const rawBounds = useAtomValue(mapViewportBoundsAtom)
  const [bounds] = useDebounce(rawBounds, VIEWPORT_ENVELOPE_DEBOUNCE_MS)
  const result = useLiveQuery<UploadRow>(uploadFeaturesSql, [
    props.layer.vector_layer_id,
    ...viewportParams(bounds),
    Math.max(0, props.layer.max_features ?? 1000),
  ])
  const data = useMemo(() => result?.rows.map(uploadFeature), [result])
  return (
    <VectorFeatures
      {...props}
      data={data}
    />
  )
}
