import { useIntl } from 'react-intl'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Accordion } = fluentUiReactComponents
import type {
  AccordionToggleData,
  AccordionToggleEvent,
} from '@fluentui/react-components'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/utils/reorder'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { useAtom, atom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { ActiveLayer } from './Active/index.tsx'
import { projectAreaTable, useProjectAreaLayer } from '../../../../../modules/projectAreaLayer.tsx'
import { mapLayerSortingAtom } from '../../../../../store.ts'
import { useUrlLayers } from '../../../../../modules/useUrlLayers.ts'
import { isBackgroundLayerId } from '../../../layers/backgroundLayers.ts'
import { DragAndDropContext } from './DragAndDropContext.ts'
import {
  getItemRegistry,
  ReorderItemProps,
  isItemData,
} from '../../../../shared/DragAndDrop/index.tsx'
import layersStyles from '../index.module.css'
import styles from './index.module.css'
import type WmsLayers from '../../../../../models/public/WmsLayers.ts'
import type VectorLayers from '../../../../../models/public/VectorLayers.ts'
import type TileLayers from '../../../../../models/public/TileLayers.ts'

// rows built by the queries below:
// all columns of the layer plus info of it's active layer_presentation
// plus the columns of the other layer type (undefined at runtime)
type LayerRowCommon = {
  layer_presentation_id: string
  layer_presentation_active: boolean
  cluster_markers?: boolean
  label?: string | null
  name?: string | null
  type?: VectorLayers['type']
  own_table?: VectorLayers['own_table']
  own_table_level?: number | null
  wfs_service_id?: VectorLayers['wfs_service_id']
  wfs_service_layer_name?: string | null
  max_features?: number | null
  vector_layer_id?: VectorLayers['vector_layer_id']
  wms_layer_id?: WmsLayers['wms_layer_id']
  wms_service_id?: WmsLayers['wms_service_id']
  wms_service_layer_name?: string | null
  tile_layer_id?: TileLayers['tile_layer_id']
  url_template?: TileLayers['url_template']
  is_background?: TileLayers['is_background']
}
export type ActiveWmsLayerRow = WmsLayers &
  LayerRowCommon & { layer_type: 'wms' }
export type ActiveVectorLayerRow = VectorLayers &
  LayerRowCommon & { layer_type: 'vector' }
export type ActiveTileLayerRow = TileLayers &
  LayerRowCommon & { layer_type: 'tile' }
export type ActiveLayerRow =
  ActiveWmsLayerRow | ActiveVectorLayerRow | ActiveTileLayerRow

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom<string[]>([])

export const ActiveLayers = () => {
  const { formatMessage } = useIntl()
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  // ?layers= override-aware render list (see the hook): reordering writes
  // the param while an override is active, the sorting atom otherwise
  const { layers: effectiveLayers, isOverridden, setLayers, isLayerVisible } = useUrlLayers()

  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const { available } = useProjectAreaLayer(projectId)

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
  const activeWmsLayers = (resWmsLayers?.rows ??
    []) as unknown as ActiveWmsLayerRow[]

  const resVectorLayers = useLiveQuery(
    `
    SELECT 
      vector_layers.*,
      layer_presentations.cluster_markers,
      layer_presentations.layer_presentation_id,
      layer_presentations.active as layer_presentation_active,
      'vector' as layer_type
    FROM vector_layers 
      INNER JOIN layer_presentations 
        ON vector_layers.vector_layer_id = layer_presentations.vector_layer_id 
        AND (layer_presentations.active OR vector_layers.own_table = '${projectAreaTable}')
      WHERE vector_layers.project_id = $1`,
    [projectId],
  )
  const activeVectorLayers = (resVectorLayers?.rows ??
    []) as unknown as ActiveVectorLayerRow[]

  const resTileLayers = useLiveQuery(
    `
    SELECT tl.*, lp.layer_presentation_id, lp.active as layer_presentation_active, 'tile' as layer_type
    FROM tile_layers tl
      JOIN layer_presentations lp ON tl.tile_layer_id = lp.tile_layer_id
        AND lp.active = TRUE
    WHERE tl.project_id = $1
      AND tl.is_background = FALSE`,
    [projectId],
  )
  const activeTileLayers = (resTileLayers?.rows ??
    []) as unknown as ActiveTileLayerRow[]

  // background tile layers render via render list membership alone (like
  // the osm pseudo layer): their presentation ids must survive the
  // mapLayerSorting sync below even though they are not active
  const resTileBackgrounds = useLiveQuery(
    `
    SELECT lp.layer_presentation_id
    FROM tile_layers tl
      JOIN layer_presentations lp ON tl.tile_layer_id = lp.tile_layer_id
    WHERE tl.project_id = $1
      AND tl.is_background = TRUE`,
    [projectId],
  )
  const tileBackgroundPresentationIds: string[] = (
    (resTileBackgrounds?.rows ?? []) as { layer_presentation_id: string }[]
  ).map((r) => r.layer_presentation_id)

  // union queries?
  // + faster querying
  // + less renders
  // - need to handle different columns

  // sort by the effective render list: with an active ?layers= override
  // that is the param (so drawer order, map order and url agree); without
  // one it is mapLayerSorting
  const databaseLayers = [
    ...activeWmsLayers,
    ...activeVectorLayers,
    ...activeTileLayers,
  ]
  const activeLayers = databaseLayers.filter((layer) =>
    layer.own_table !== projectAreaTable ||
    (layer.project_id === projectId && available && isLayerVisible(layer.layer_presentation_id, layer.layer_presentation_active)),
  ).sort((a, b) => {
    const aIndex = effectiveLayers.findIndex(
      (ls) => ls === a.layer_presentation_id,
    )
    const bIndex = effectiveLayers.findIndex(
      (ls) => ls === b.layer_presentation_id,
    )
    return aIndex - bIndex
  })

  const layerPresentationIds = activeLayers.map((l) => l.layer_presentation_id)
  // The URL switches the user's view, not the project's default draw order.
  const databaseIds = databaseLayers.filter((l) => l.layer_presentation_active).map((l) => l.layer_presentation_id)

  // when activeLayers changes, update mapLayerSorting:
  // add missing layer's layer_presentation_id's to mapLayerSorting
  // remove layer_presentation_id's that are not in activeLayers
  useEffect(() => {
    // wait for all live queries to have resolved: syncing the atom from a
    // half-loaded state (queries still undefined) wipes ids the not-yet
    // loaded keep-sets should have protected — e.g. a freshly picked
    // background tile layer
    if (
      !resWmsLayers ||
      !resVectorLayers ||
      !resTileLayers ||
      !resTileBackgrounds
    )
      return
    if (!databaseIds.length) return

    const run = async () => {
      const missingLayerPresentations = databaseIds.filter(
        (lpId) => !mapLayerSorting.includes(lpId),
      )
      // don't remove background layers (osm, positron, dark matter):
      // will lead to unlimited re-rendering
      const removeLayerPresentations = mapLayerSorting.filter(
        (lpId) =>
          !databaseIds.includes(lpId) &&
          !isBackgroundLayerId(lpId) &&
          !tileBackgroundPresentationIds.includes(lpId),
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
  }, [
    databaseIds,
    mapLayerSorting,
    setMapLayerSorting,
    tileBackgroundPresentationIds,
    resWmsLayers,
    resVectorLayers,
    resTileLayers,
    resTileBackgrounds,
  ])

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
      // Reorder only overlay slots; leave background layers in place.
      const activesIds = new Set(layerPresentationIds)
      const orderedVisibleActives = newLayerSorting.filter((lpId) =>
        effectiveLayers.includes(lpId),
      )
      let i = 0
      const newEffectiveLayers = effectiveLayers.map((lpId) =>
        activesIds.has(lpId) && orderedVisibleActives.includes(lpId) ?
          (orderedVisibleActives[i++] ?? lpId)
        : lpId,
      )
      if (isOverridden) setLayers(newEffectiveLayers)
      else setMapLayerSorting(newEffectiveLayers)
    },
    [
      layerPresentationIds,
      setMapLayerSorting,
      isOverridden,
      effectiveLayers,
      setLayers,
    ],
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
            (targetData.layer as ActiveLayerRow).layer_presentation_id,
        )
        if (indexOfTarget < 0) {
          return
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData)

        reorderItem({
          startIndex: sourceData.index as number,
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

  const onToggleItem = (
    _event: AccordionToggleEvent,
    { openItems }: AccordionToggleData<string>,
  ) => setOpenItems(openItems)

  if (projectId === '99999999-9999-9999-9999-999999999999') {
    return (
      <section>
        <h2 className={layersStyles.title}>{formatMessage({ id: 'bB8NpQ', defaultMessage: 'Aktiv' })}</h2>
        <div className={styles.layerList}>
          <p className={styles.noLayers}>
            {formatMessage({ id: 'mapChooseProjectForLayers', defaultMessage: 'Projekt wählen, um diese Ebenen zu sehen.' })}
          </p>
        </div>
      </section>
    )
  }

  return (
    <ErrorBoundary>
      <DragAndDropContext.Provider value={dragAndDropContextValue}>
        <section>
          <h2 className={layersStyles.title}>{formatMessage({ id: 'bB8NpQ', defaultMessage: 'Aktiv' })}</h2>
          <Accordion
            multiple
            collapsible
            openItems={openItems}
            onToggle={onToggleItem}
          >
            {activeLayers.length ?
              activeLayers?.map((l, index) => (
                <ActiveLayer
                  key={l.layer_presentation_id}
                  layer={l}
                  index={index}
                  layerCount={activeLayers.length}
                  isLast={index === activeLayers.length - 1}
                  isOpen={openItems.includes(l.layer_presentation_id)}
                />
              ))
            : <p className={styles.noLayers}>{formatMessage({ id: 'mapNoActiveLayers', defaultMessage: 'Keine aktiven Ebenen' })}</p>}
          </Accordion>
        </section>
      </DragAndDropContext.Provider>
    </ErrorBoundary>
  )
}
