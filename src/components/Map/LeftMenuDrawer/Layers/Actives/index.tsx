import {
  memo,
  useEffect,
  useMemo,
  useState,
  useCallback,
  createContext,
  useContext,
} from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
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

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { ActiveLayer } from './Active.tsx'
import { isItemData } from './shared.ts'
import { IsNarrowContext } from '../../IsNarrowContext.ts'

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

const titleStyle = {
  paddingLeft: 10,
  paddingRight: 10,
  fontSize: '1.2em',
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
  const { project_id } = useParams()
  const { user: authUser } = useCorbado()
  const isNarrow = useContext(IsNarrowContext)

  const { db } = useElectric()!

  // get app_state
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
      // TODO: adding this select leads to weird errors when adding layers:
      // Argument `where` for query on app_states type requires at least one argument
      // select: { map_layer_sorting: true },
    }),
  )
  const layerSorting = useMemo(
    () => appState?.map_layer_sorting ?? [],
    [appState],
  )

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

  // sort by app_states.map_layer_sorting
  const activeLayers = useMemo(
    () =>
      [...activeWmsLayers, ...activeVectorLayers].sort((a, b) => {
        const aIndex = layerSorting.findIndex(
          (ls) => ls === a.layer_presentations?.[0]?.layer_presentation_id,
        )
        const bIndex = layerSorting.findIndex(
          (ls) => ls === b.layer_presentations?.[0]?.layer_presentation_id,
        )
        return aIndex - bIndex
      }),
    [activeWmsLayers, activeVectorLayers, layerSorting],
  )

  const layerPresentationIds = activeLayers.map(
    (l) => l.layer_presentations?.[0]?.layer_presentation_id,
  )

  // when activeLayers changes, update app_state.map_layer_sorting:
  // add missing layer's layer_presentation_id's to app_state.map_layer_sorting
  // remove layer_presentation_id's that are not in activeLayers
  useEffect(() => {
    if (!layerPresentationIds.length) return
    if (!appState) return

    const run = async () => {
      const missingLayerPresentations = layerPresentationIds.filter(
        (lpId) => !layerSorting.includes(lpId),
      )
      const removeLayerPresentations = layerSorting.filter(
        (lpId) => !layerPresentationIds.includes(lpId),
      )
      if (
        !missingLayerPresentations.length &&
        !removeLayerPresentations.length
      ) {
        // nothing to change
        return
      }

      const newLayerSorting = [
        ...layerSorting.filter((ls) => !removeLayerPresentations.includes(ls)),
        ...missingLayerPresentations,
      ]
      await db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: {
          map_layer_sorting: newLayerSorting,
        },
      })
    }
    run()
  }, [appState, db.app_states, layerPresentationIds, layerSorting])

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
      if (!appState) {
        return console.warn(
          'Actives.reorderItem returning because appState is null',
        )
      }
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
      await db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { map_layer_sorting: newLayerSorting },
      })

      setLastCardMoved({
        item,
        previousIndex: startIndex,
        currentIndex: finishIndex,
        numberOfItems: layerSorting.length,
      })
    },
    [activeLayers, appState, db.app_states, layerPresentationIds, layerSorting],
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

  return (
    <ErrorBoundary>
      <ListContext.Provider value={contextValue}>
        <section>
          <h2 style={titleStyle}>Active</h2>
          <div
            style={{
              ...layerListStyle,
              ...(isNarrow ? {} : { width: 'calc(100% - 6px)' }),
            }}
          >
            <Accordion multiple collapsible>
              {activeLayers.length ? (
                activeLayers?.map((l, index) => (
                  <ActiveLayer
                    key={l.wms_layer_id ?? l.vector_layer_id}
                    layer={l}
                    index={index}
                    layerCount={activeLayers.length}
                    isLast={index === activeLayers.length - 1}
                  />
                ))
              ) : (
                <p style={noLayersStyle}>No active layers</p>
              )}
            </Accordion>
          </div>
        </section>
      </ListContext.Provider>
    </ErrorBoundary>
  )
})