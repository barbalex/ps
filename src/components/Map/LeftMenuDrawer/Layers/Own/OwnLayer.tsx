import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  ToggleButton,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Tab,
  TabList,
} = fluentUiReactComponents
import type {
  SelectTabData,
  SelectTabEvent,
} from '@fluentui/react-components'
import { BsCheckSquareFill, BsSquare } from 'react-icons/bs'
import { useAtom } from 'jotai'
import { useLocation } from '@tanstack/react-router'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import { useUrlLayers } from '../../../../../modules/useUrlLayers.ts'
import {
  designingAtom,
  mapDrawerVectorLayerDisplayAtom,
} from '../../../../../store.ts'
import { VectorLayerEditing } from '../Vector/Editing.tsx'
import { LayerPresentationForm } from '../LayerPresentationForm.tsx'
import { VectorLayerDisplays } from '../../../../../formsAndLists/vectorLayerDisplays.tsx'
import { VectorLayerDisplay } from '../../../../../formsAndLists/vectorLayerDisplay/index.tsx'
import type VectorLayers from '../../../../../models/public/VectorLayers.ts'
import layerStyles from '../index.module.css'
import styles from './OwnLayer.module.css'

type TabType = 'overall-displays' | 'feature-displays' | 'config'

export type OwnLayerRow = VectorLayers & {
  label: string
  layer_presentations?: { layer_presentation_id: string; active: boolean }[]
  // passed to LayerPresentationForm (undefined for layers without presentation)
  layer_presentation_id?: string
}

export const OwnLayer = ({
  layer,
  isLast,
  isOpen,
}: {
  layer: OwnLayerRow
  isLast: boolean
  isOpen: boolean
}) => {
  const { projectId } = useParams({ strict: false })
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const { setLayerVisible, isLayerVisible } = useUrlLayers()
  const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const [tab, setTab] = useState<TabType>('overall-displays')
  const { pathname } = useLocation()

  const layerPresentationId = layer.layer_presentations?.[0]?.layer_presentation_id
  const isVisible = isLayerVisible(
    layerPresentationId ?? '',
    layer.layer_presentations?.[0]?.active ?? false,
  )

  // toggling layer visibility is a view action: it writes the ?layers=
  // url param (linkable, no permissions needed). Only a layer without a
  // layer_presentation row needs the db write that creates one.
  const onChange = async () => {
    if (isVisible) {
      setLayerVisible(layerPresentationId!, false)
      return
    }
    if (!layerPresentationId) {
      // create the missing layer_presentation
      // For table layers (own_table is set), skip operation queue as they are system-managed
      const isTableLayer = !!layer.own_table
      await createLayerPresentation({
        vectorLayerId: layer.vector_layer_id,
        active: true,
        skipOperationQueue: isTableLayer,
      } as unknown as Parameters<typeof createLayerPresentation>[0])
      return
    }
    setLayerVisible(layerPresentationId, true)
  }

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) =>
    setTab(data.value as TabType)

  const onClickFeatureDisplays = () => setVectorLayerDisplayId(null)

  return (
    <ErrorBoundary>
      <AccordionItem
        value={layer.vector_layer_id}
        className={`${styles.accordionItem}${isOpen ? ` ${styles.accordionOpen}` : isLast ? ` ${styles.accordionLast}` : ''}`}
      >
        <AccordionHeader
          expandIconPosition="end"
          size="extra-large"
          expandIcon={designing ? undefined : null}
          className={isOpen ? styles.headerOpen : undefined}
        >
          <div className={layerStyles.headerContainer}>
            <ToggleButton
              icon={
                isVisible ? (
                  <BsCheckSquareFill
                    className={layerStyles.headerToggleIcon}
                  />
                ) : (
                  <BsSquare className={layerStyles.headerToggleIcon} />
                )
              }
              checked={isVisible}
              onClick={(event) => {
                // only the visibility toggle, not the accordion header
                event.stopPropagation()
                onChange()
              }}
              className={`${styles.labelButton}${isOpen ? ` ${styles.toggleOpen}` : ''}`}
              // as the accordion header is a button, we need to set this as an a
              // because nested buttons are not allowed
              as="a"
            />
            <p className={layerStyles.headerLabel}>{layer.label}</p>
          </div>
        </AccordionHeader>
        <AccordionPanel className={layerStyles.panel}>
          <TabList
            selectedValue={tab}
            onTabSelect={onTabSelect}
            className={layerStyles.tabList}
          >
            <Tab value="overall-displays">Overall Display</Tab>
            <Tab value="feature-displays" onClick={onClickFeatureDisplays}>
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
                  {...{ from: pathname }}
                />
              ) : (
                <VectorLayerDisplays
                  vectorLayerId={layer.vector_layer_id}
                  {...{ from: pathname }}
                />
              )}
            </>
          )}
        </AccordionPanel>
      </AccordionItem>
    </ErrorBoundary>
  )
}
