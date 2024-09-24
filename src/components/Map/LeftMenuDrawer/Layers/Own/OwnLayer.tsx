import { memo, useCallback } from 'react'
import {
  Checkbox,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@fluentui/react-components'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import { designingAtom } from '../../../../../store.ts'
import { VectorLayerEditing } from '../Vector/Editing.tsx'
import { panelStyle } from '../styles.ts'

type Props = {
  layer: VectorLayer
  isLast: number
  isOpen: boolean
}

export const OwnLayer = memo(({ layer, isLast, isOpen }: Props) => {
  const [designing] = useAtom(designingAtom)
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
      <AccordionItem
        value={layer.vector_layer_id}
        style={{
          borderTop: `${isOpen ? 3 : 1}px solid rgba(55, 118, 28, 0.5)`,
          ...(isLast
            ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' }
            : {}),
          ...(isOpen
            ? { borderBottom: `3px solid rgba(55, 118, 28, 0.5)` }
            : {}),
        }}
      >
        <AccordionHeader
          expandIconPosition="end"
          size="extra-large"
          expandIcon={designing ? undefined : null}
        >
          <Checkbox
            key={layer.vector_layer_id}
            size="large"
            label={layer.label}
            // checked if layer has an active presentation
            // always false because of the filter
            checked={false}
            onChange={onChange}
          />
        </AccordionHeader>
        <AccordionPanel style={panelStyle}>
          <VectorLayerEditing layer={layer} />
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
})
