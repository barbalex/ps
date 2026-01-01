import { useEffect, useState, useCallback } from 'react'
import { useParams } from '@tanstack/react-router'
import { Accordion } from '@fluentui/react-components'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { useAtom, atom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { ActiveLayer } from './Active/index.tsx'
import { mapLayerSortingAtom } from '../../../../../store.ts'
import { DragAndDropContext } from './DragAndDropContext.ts'
import {
  getItemRegistry,
  ReorderItemProps,
  isItemData,
} from '../../../../shared/DragAndDrop/index.tsx'
import layersStyles from '../index.module.css'
import styles from './index.module.css'
import type LayerPresentations from '../../../../../models/public/LayerPresentations.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

export const ActiveLayers = () => {
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const [openItems, setOpenItems] = useAtom(openItemsAtom)

  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const db = usePGlite()

  const resWmsLayers = useLiveQuery(
    `
    SELECT 
      wms_layers.*, 
      layer_presentations.layer_presentation_id,
      layer_presentations.active as layer_presentation_active,
      'wms' as layer_type
    FROM wms_layers
      INNER JOIN layer_presentations 
        ON wms_layers.wms_layer_id = layer_presentations.wms_layer_id 
        AND layer_presentations.active = TRUE
    WHERE wms_layers.project_id = $1`,
    [projectId],
  )
  const activeWmsLayers = resWmsLayers?.rows ?? []

  const resVectorLayers = useLiveQuery(
    `
    SELECT 
      vector_layers.*,
      layer_presentations.layer_presentation_id,
      layer_presentations.active as layer_presentation_active,
      'vector' as layer_type
    FROM vector_layers 
      INNER JOIN layer_presentations 
        ON vector_layers.vector_layer_id = layer_presentations.vector_layer_id 
        AND layer_presentations.active = TRUE
      WHERE vector_layers.project_id = $1`,
    [projectId],
  )
  const activeVectorLayers = resVectorLayers?.rows ?? []

  // union queries?
  // + faster querying
  // + less renders
  // - need to handle different columns

  // sort by mapLayerSorting
  const activeLayers = [...activeWmsLayers, ...activeVectorLayers].sort(
    (a, b) => {
      const aIndex = mapLayerSorting.findIndex(
        (ls) => ls === a.layer_presentation_id,
      )
      const bIndex = mapLayerSorting.findIndex(
        (ls) => ls === b.layer_presentation_id,
      )
      return aIndex - bIndex
    },
  )

  const layerPresentationIds = activeLayers.map((l) => l.layer_presentation_id)

  // when activeLayers changes, update mapLayerSorting:
  // add missing layer's layer_presentation_id's to mapLayerSorting
  // remove layer_presentation_id's that are not in activeLayers
  useEffect(() => {
    if (!layerPresentationIds.length) return

    const run = async () => {
      const missingLayerPresentations = layerPresentationIds.filter(
        (lpId) => !mapLayerSorting.includes(lpId),
      )
      // don't remove osm: will lead to unlimited re-rendering
      const removeLayerPresentations = mapLayerSorting.filter(
        (lpId) =>
          !layerPresentationIds.includes(lpId) &&
          lpId !== 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // osm
      )
      if (
        !missingLayerPresentations.length &&
        !removeLayerPresentations.length
      ) {
        // nothing to change
        return
      }

      const newLayerSorting = [
        ...mapLayerSorting.filter(
          (ls) => !removeLayerPresentations.includes(ls),
        ),
        ...missingLayerPresentations,
      ]
      setMapLayerSorting(newLayerSorting)
    }
    run()
  }, [layerPresentationIds, mapLayerSorting, setMapLayerSorting])

  const [registry] = useState(getItemRegistry)

  // Isolated instances of this component from one another
  const [instanceId] = useState(() => Symbol('instance-id'))

  const reorderItem = useCallback(
    async ({
      startIndex,
      indexOfTarget,
      closestEdgeOfTarget,
    }: ReorderItemProps) => {
      const finishIndex = getReorderDestinationIndex({
        startIndex,
        closestEdgeOfTarget,
        indexOfTarget,
        axis: 'vertical',
      })

      if (finishIndex === startIndex) {
        // If there would be no change, we skip the update
        return
      }

      const newLayerSorting = reorder({
        list: layerPresentationIds,
        startIndex,
        finishIndex,
      })
      setMapLayerSorting(newLayerSorting)
    },
    [layerPresentationIds, setMapLayerSorting],
  )

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isItemData(source.data) && source.data.instanceId === instanceId
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0]
        if (!target) {
          return
        }

        const sourceData = source.data
        const targetData = target.data
        if (!isItemData(sourceData) || !isItemData(targetData)) {
          return
        }

        const indexOfTarget = activeLayers.findIndex(
          (layer) =>
            layer.layer_presentation_id ===
            targetData.layer.layer_presentation_id,
        )
        if (indexOfTarget < 0) {
          return
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData)

        reorderItem({
          startIndex: sourceData.index,
          indexOfTarget,
          closestEdgeOfTarget,
        })
      },
    })
  }, [activeLayers, instanceId, reorderItem])

  const getListLength = () => activeLayers.length

  const dragAndDropContextValue = {
    registerItem: registry.register,
    reorderItem,
    instanceId,
    getListLength,
  }

  const onToggleItem = (event, { value: layerPresentationId, openItems }) => {
    // use setTimeout to let the child checkbox set the layers active status
    setTimeout(async () => {
      // fetch layerPresentation's active status
      const res = await db.query(
        `SELECT active FROM layer_presentations WHERE layer_presentation_id = $1`,
        [layerPresentationId],
      )
      const isActive: LayerPresentations['active'] = res?.rows?.[0]?.active
      if (!isActive) {
        // if not active, remove this item
        const newOpenItems = openItems.filter(
          (id) => id !== layerPresentationId,
        )
        setOpenItems(newOpenItems)
        return
      }
      setOpenItems(openItems)
    })
  }

  if (projectId === '99999999-9999-9999-9999-999999999999') {
    return (
      <section>
        <h2 className={layersStyles.title}>Active</h2>
        <div className={styles.layerList}>
          <p className={styles.noLayers}>
            Active layers are accessible when a project is active
          </p>
        </div>
      </section>
    )
  }

  // Accordion should NOT toggle when the active-checkbox is clicked
  // Solution:
  // use controlled accordion
  // onToggle: wait 0ms before toggling
  // do not toggle if that layers presentation is no more active
  return (
    <ErrorBoundary>
      <DragAndDropContext.Provider value={dragAndDropContextValue}>
        <section>
          <h2 className={layersStyles.title}>Active</h2>
          <Accordion
            multiple
            collapsible
            openItems={openItems}
            onToggle={onToggleItem}
          >
            {activeLayers.length ? (
              activeLayers?.map((l, index) => (
                <ActiveLayer
                  key={l.wms_layer_id ?? l.vector_layer_id}
                  layer={l}
                  index={index}
                  layerCount={activeLayers.length}
                  isLast={index === activeLayers.length - 1}
                  isOpen={openItems.includes(l.layer_presentation_id)}
                />
              ))
            ) : (
              <p className={styles.noLayers}>No active layers</p>
            )}
          </Accordion>
        </section>
      </DragAndDropContext.Provider>
    </ErrorBoundary>
  )
}
