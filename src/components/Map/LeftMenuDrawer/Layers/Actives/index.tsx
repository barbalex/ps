import {
  memo,
  useEffect,
  useMemo,
  useState,
  useCallback,
  createContext,
} from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Accordion } from '@fluentui/react-components'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region'
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { useAtom, atom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { ActiveLayer } from './Active.tsx'
import { isItemData } from './shared.ts'
import { mapLayerSortingAtom } from '../../../../../store.ts'
import { titleStyle } from '../styles.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

type ItemEntry = { itemId: string; element: HTMLElement }

function getItemRegistry() {
  const registry = new Map<string, HTMLElement>()

  function register({ itemId, element }: ItemEntry) {
    registry.set(itemId, element)

    return function unregister() {
      registry.delete(itemId)
    }
  }

  function getElement(itemId: string): HTMLElement | null {
    return registry.get(itemId) ?? null
  }

  return { register, getElement }
}

export const ListContext = createContext<ListContextValue | null>(null)

type ReorderItemProps = {
  startIndex: number
  indexOfTarget: number
  closestEdgeOfTarget: Edge | null
}

type LastCardMoved = {
  item: Item
  previousIndex: number
  currentIndex: number
  numberOfItems: number
} | null

type CleanupFn = () => void
type ListContextValue = {
  getListLength: () => number
  registerItem: (entry: ItemEntry) => CleanupFn
  reorderItem: (args: {
    startIndex: number
    indexOfTarget: number
    closestEdgeOfTarget: Edge | null
  }) => void
  instanceId: symbol
}

const layerListStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}
const noLayersStyle = {
  margin: 0,
  paddingLeft: 10,
  paddingRight: 10,
  paddingBottom: 10,
}

export const ActiveLayers = memo(() => {
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const [openItems, setOpenItems] = useAtom(openItemsAtom)

  const { project_id } = useParams()

  const { db } = useElectric()!

  const where = project_id ? { project_id } : {}

  const { results: wmsLayers = [] } = useLiveQuery(
    db.wms_layers.liveMany({
      where,
      include: { layer_presentations: true },
    }),
  )
  const activeWmsLayers = wmsLayers.filter((l) =>
    (l.layer_presentations ?? []).some(
      (lp) => lp.wms_layer_id === l.wms_layer_id && lp.active,
    ),
  )

  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where,
      include: { layer_presentations: true },
    }),
  )
  const activeVectorLayers = vectorLayers.filter((l) =>
    (l.layer_presentations ?? []).some(
      (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
    ),
  )

  // sort by mapLayerSorting
  const activeLayers = useMemo(
    () =>
      [...activeWmsLayers, ...activeVectorLayers].sort((a, b) => {
        const aIndex = mapLayerSorting.findIndex(
          (ls) => ls === a.layer_presentations?.[0]?.layer_presentation_id,
        )
        const bIndex = mapLayerSorting.findIndex(
          (ls) => ls === b.layer_presentations?.[0]?.layer_presentation_id,
        )
        return aIndex - bIndex
      }),
    [activeWmsLayers, activeVectorLayers, mapLayerSorting],
  )

  const layerPresentationIds = activeLayers.map(
    (l) => l.layer_presentations?.[0]?.layer_presentation_id,
  )

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
        (lpId) => !layerPresentationIds.includes(lpId) && lpId !== 'osm',
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
  const [lastCardMoved, setLastCardMoved] = useState<LastCardMoved>(null)

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

      const item = activeLayers[startIndex]

      const newLayerSorting = reorder({
        list: layerPresentationIds,
        startIndex,
        finishIndex,
      })
      setMapLayerSorting(newLayerSorting)

      setLastCardMoved({
        item,
        previousIndex: startIndex,
        currentIndex: finishIndex,
        numberOfItems: mapLayerSorting.length,
      })
    },
    [
      activeLayers,
      layerPresentationIds,
      mapLayerSorting.length,
      setMapLayerSorting,
    ],
  )

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isItemData(source.data) && source.data.instanceId === instanceId // works
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
            layer.layer_presentations?.[0]?.layer_presentation_id ===
            targetData.layer.layer_presentations?.[0]?.layer_presentation_id,
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

  // once a drag is finished, we have some post drop actions to take
  useEffect(() => {
    if (lastCardMoved === null) {
      return
    }

    const { item, previousIndex, currentIndex, numberOfItems } = lastCardMoved
    const element = registry.getElement(item.id)
    if (element) {
      triggerPostMoveFlash(element)
    }

    liveRegion.announce(
      `You've moved ${item.label} from position ${
        previousIndex + 1
      } to position ${currentIndex + 1} of ${numberOfItems}.`,
    )
  }, [lastCardMoved, registry])

  // cleanup the live region when this component is finished
  useEffect(() => {
    return function cleanup() {
      liveRegion.cleanup()
    }
  }, [])

  const getListLength = useCallback(
    () => activeLayers.length,
    [activeLayers.length],
  )

  const contextValue: ListContextValue = useMemo(() => {
    return {
      registerItem: registry.register,
      reorderItem,
      instanceId,
      getListLength,
    }
  }, [registry.register, reorderItem, instanceId, getListLength])

  const onToggleItem = useCallback(
    (event, { value: layerPresentationId, openItems }) => {
      // use setTimeout to let the child checkbox set the layers active status
      setTimeout(async () => {
        // fetch layerPresentation's active status
        const layerPresentation = await db.layer_presentations.findFirst({
          where: { layer_presentation_id: layerPresentationId },
        })
        const isActive = layerPresentation?.active
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
    },
    [db.layer_presentations, setOpenItems],
  )

  if (!project_id) {
    return (
      <section>
        <h2 style={titleStyle}>Active</h2>
        <div style={layerListStyle}>
          <p style={noLayersStyle}>
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
      <ListContext.Provider value={contextValue}>
        <section>
          <h2 style={titleStyle}>Active</h2>
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
                  isOpen={openItems.includes(
                    l.layer_presentations?.[0]?.layer_presentation_id,
                  )}
                />
              ))
            ) : (
              <p style={noLayersStyle}>No active layers</p>
            )}
          </Accordion>
        </section>
      </ListContext.Provider>
    </ErrorBoundary>
  )
})
