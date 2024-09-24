import { memo, useCallback } from 'react'
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  Tab,
  TabList,
  SelectTabData,
} from '@fluentui/react-components'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import {
  designingAtom,
  mapDrawerWmsLayerDisplayAtom,
} from '../../../../../store.ts'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { WmsLayerEditing } from './Editing.tsx'
import { panelStyle, tabListStyle } from '../styles.ts'

type TabType = 'config' | 'overall-displays'

type Props = {
  layer: WmsLayer
  isLast: number
  isOpen: boolean
}

export const WmsLayer = memo(({ layer, isLast, isOpen }: Props) => {
  const [designing] = useAtom(designingAtom)
  const [wmsLayerDisplayId, setWmsLayerDisplayId] = useAtom(
    mapDrawerWmsLayerDisplayAtom,
  )
  const { db } = useElectric()!

  const onChange = useCallback(async () => {
    // 1. check if layer has a presentation
    const presentation = await db.layer_presentations.findFirst({
      where: { wms_layer_id: layer.wms_layer_id },
    })
    // 2. if not, create one
    if (!presentation) {
      const data = createLayerPresentation({
        wms_layer_id: layer.wms_layer_id,
        active: true,
      })
      db.layer_presentations.create({ data })
    }
    // 3. if yes, update it
    else {
      db.layer_presentations.update({
        where: { layer_presentation_id: presentation.layer_presentation_id },
        data: { active: true },
      })
    }
  }, [db.layer_presentations, layer.wms_layer_id])

  const onTabSelect = useCallback(
    (event, data: SelectTabData) => setTab(data.value),
    [],
  )

  return (
    <ErrorBoundary>
      <AccordionItem
        value={layer.wms_layer_id}
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
          style={
            isOpen
              ? {
                  backgroundColor: 'rgba(103, 216, 101, 0.1)',
                }
              : {}
          }
        >
          <Checkbox
            key={layer.wms_layer_id}
            size="large"
            label={layer.label}
            // checked if layer has an active presentation
            // always false because of the filter
            checked={false}
            onChange={onChange}
          />
        </AccordionHeader>
        <AccordionPanel style={panelStyle}>
          <WmsLayerEditing layer={layer} />
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
})
