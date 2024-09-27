import { memo, useCallback, useState } from 'react'
import {
  ToggleButton,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Tab,
  TabList,
  SelectTabData,
} from '@fluentui/react-components'
import { BsSquare } from 'react-icons/bs'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import {
  designingAtom,
  mapDrawerVectorLayerDisplayAtom,
} from '../../../../../store.ts'
import { VectorLayerEditing } from '../Vector/Editing.tsx'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { Component as VectorLayerDisplays } from '../../../../../routes/vectorLayerDisplays.tsx'
import { Component as VectorLayerDisplay } from '../../../../../routes/vectorLayerDisplay/index.tsx'
import {
  panelStyle,
  tabListStyle,
  headerContainerStyle,
  headerToggleIconStyle,
  headerLabelStyle,
} from '../styles.ts'
import { css } from '../../../../../css.ts'

type TabType = 'overall-displays' | 'feature-displays' | 'config'

type Props = {
  layer: VectorLayer
  isLast: number
  isOpen: boolean
}

export const OwnLayer = memo(({ layer, isLast, isOpen }: Props) => {
  const [designing] = useAtom(designingAtom)
  const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const { db } = useElectric()!
  const [tab, setTab] = useState<TabType>('overall-displays')

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
    (event, data: SelectTabData) => setTab(data.value),
    [],
  )

  const onClickFeatureDisplays = useCallback(
    () => setVectorLayerDisplayId(null),
    [setVectorLayerDisplayId],
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
          style={
            isOpen
              ? {
                  backgroundColor: 'rgba(103, 216, 101, 0.1)',
                }
              : {}
          }
        >
          <div style={headerContainerStyle}>
            <ToggleButton
              icon={<BsSquare style={headerToggleIconStyle} />}
              checked={false}
              onClick={onChange}
              style={css({
                marginLeft: 2,
                border: 'none',
                ...(isOpen ? { background: 'none' } : {}),
                on: ($) => [
                  $('&:hover', {
                    backgroundColor: 'var(--colorNeutralBackground1Hover)',
                  }),
                ],
              })}
              // as the accordion header is a button, we need to set this as an a
              // because nested buttons are not allowed
              as="a"
            />
            <p style={headerLabelStyle}>{layer.label}</p>
          </div>
        </AccordionHeader>
        <AccordionPanel style={panelStyle}>
          <TabList
            selectedValue={tab}
            onTabSelect={onTabSelect}
            style={tabListStyle}
          >
            <Tab value="overall-displays">Overall Display</Tab>
            <Tab
              value="feature-displays"
              onClick={onClickFeatureDisplays}
            >
              Feature Displays
            </Tab>
            <Tab value="config">Config</Tab>
          </TabList>
          {tab === 'config' && <VectorLayerEditing layer={layer} />}
          {tab === 'overall-displays' && (
            <LayerPresentationForm layer={layer} />
          )}
          {tab === 'feature-displays' && (
            <>
              {vectorLayerDisplayId ? (
                <VectorLayerDisplay
                  vectorLayerDisplayId={vectorLayerDisplayId}
                />
              ) : (
                <VectorLayerDisplays vectorLayerId={layer.vector_layer_id} />
              )}
            </>
          )}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
})
