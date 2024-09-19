import { memo, useCallback } from 'react'
import { Checkbox } from '@fluentui/react-components'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'

export const VectorLayer = memo(({ layer }) => {
  const { db } = useElectric()!

  const onChange = useCallback(async () => {
    if (!layer.layer_presentations?.[0]?.layer_presentation_id) {
      // create the missing layer_presentation
      const layerPresentation = createLayerPresentation({
        vector_layer_id: layer.vector_layer_id,
        active: true,
      })
      await db.layer_presentations.create({ data: layerPresentation })
    } else {
      db.layer_presentations.update({
        where: {
          layer_presentation_id:
            layer.layer_presentations?.[0]?.layer_presentation_id,
        },
        data: { active: true },
      })
    }
  }, [db.layer_presentations, layer.layer_presentations, layer.vector_layer_id])

  return (
    <ErrorBoundary>
      <Checkbox
        key={layer.vector_layer_id}
        size="large"
        label={layer.label}
        // checked if layer has an active presentation
        // always false because of the filter
        checked={false}
        onChange={onChange}
      />
    </ErrorBoundary>
  )
})
