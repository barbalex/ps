import { memo, useCallback, useState } from 'react'
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  Tab,
  TabList,
  SelectTabEvent,
  SelectTabData,
} from '@fluentui/react-components'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import { designingAtom } from '../../../../../store.ts'
import { VectorLayerEditing } from './Editing.tsx'
import { panelStyle } from '../styles.ts'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'

type Props = {
  layer: VectorLayer
  isLast: number
  isOpen: boolean
}

type TabType = 'config' | 'overall-displays' | 'feature-displays'

export const VectorLayer = memo(({ layer, isLast, isOpen }: Props) => {
  const [designing] = useAtom(designingAtom)
  const { db } = useElectric()!
  const [tab, setTab] = useState<TabType>('config')

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

  const onTabSelect = useCallback(
    (event: SelectTabEvenmt, data: SelectTabData) => setTab(data.value),
    [],
  )

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
          <TabList
            selectedValue={tab}
            onTabSelect={onTabSelect}
            style={{
              backgroundColor: 'rgba(103, 216, 101, 0.1)',
            }}
          >
            <Tab value="config">Config</Tab>
            <Tab value="overall-displays">Overall Display</Tab>
            <Tab value="feature-displays">Feature Displays</Tab>
          </TabList>
          {tab === 'config' && <VectorLayerEditing layer={layer} />}
          {tab === 'overall-displays' && <p>TODO: overall-displays</p>}
          {tab === 'feature-displays' && <p>TODO: feature-displays</p>}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
})
