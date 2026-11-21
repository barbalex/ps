import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  ToggleButton,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Tab,
  TabList,
} = fluentUiReactComponents
import type {
  SelectTabData,
  SelectTabEvent,
} from '@fluentui/react-components'
import { BsCheckSquareFill, BsSquare } from 'react-icons/bs'
import { TbZoomScan } from 'react-icons/tb'
import { useAtom, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import { useLayerActivation } from '../../../../../modules/useLayerActivation.ts'
import { useUrlLayers } from '../../../../../modules/useUrlLayers.ts'
import { zoomToVectorLayer } from '../../../../../modules/zoomToVectorLayer.ts'
import {
  addNotificationAtom,
  designingAtom,
  mapBoundsAtom,
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
  const { projectId, subprojectId } = useParams({ strict: false })
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const { isLayerVisible } = useUrlLayers()
  const { activateLayer, deactivateLayer, joinRenderList } =
    useLayerActivation()
  const [vectorLayerDisplayId, setVectorLayerDisplayId] = useAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const [tab, setTab] = useState<TabType>('overall-displays')
  const { pathname } = useLocation()
  const db = usePGlite()
  const addNotification = useSetAtom(addNotificationAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)

  const layerPresentationId = layer.layer_presentations?.[0]?.layer_presentation_id
  const isVisible = isLayerVisible(
    layerPresentationId ?? '',
    layer.layer_presentations?.[0]?.active ?? false,
  )

  // toggling layer activation sets the design flag (layer_presentations.
  // active — what lists the layer under Active) and joins the render list,
  // like every other layer toggle
  const onChange = async () => {
    // deactivate a visible layer: view off and design flag off
    if (isVisible && layerPresentationId) {
      await deactivateLayer(layerPresentationId)
      return
    }
    // activate: create the missing layer_presentation (already active) or
    // set the design flag, then make the layer render
    if (!layerPresentationId) {
      // queued like every other presentation: the server-side insert
      // trigger that used to create them is gone, and trigger/skip-queue
      // rows never synced (updates on them were discarded as no-row)
      const newLayerPresentationId = await createLayerPresentation({
        vectorLayerId: layer.vector_layer_id,
        active: true,
      } as unknown as Parameters<typeof createLayerPresentation>[0])
      if (newLayerPresentationId) joinRenderList(newLayerPresentationId)
      return
    }
    await activateLayer(layerPresentationId)
  }

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) =>
    setTab(data.value as TabType)

  const onClickFeatureDisplays = () => setVectorLayerDisplayId(null)

  const onClickZoomToLayer = (event: React.MouseEvent) => {
    event.stopPropagation()
    void zoomToVectorLayer({
      db,
      layer,
      subprojectId,
      addNotification,
      setMapBounds,
    })
  }

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
          <Button
            icon={<TbZoomScan />}
            onClick={onClickZoomToLayer}
            className={styles.headerButton}
            title="Zoom to layer"
            appearance="subtle"
            size="small"
            as="a"
          />
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
