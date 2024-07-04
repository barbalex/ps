import { memo, useEffect } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'
import { Accordion } from '@fluentui/react-components'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { ActiveLayer } from './Active.tsx'

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
  // borderTop: '1px solid rgba(55, 118, 28, 0.5)',
  // borderBottom: '1px solid rgba(55, 118, 28, 0.5)',
  margin: 0,
  paddingLeft: 10,
  paddingRight: 10,
  paddingBottom: 10,
}

export const ActiveLayers = memo(() => {
  const { project_id } = useParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!

  // get app_state
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const layerSorting = appState?.map_layer_sorting ?? []

  const where = project_id ? { project_id } : {}

  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where,
      include: { layer_presentations: true },
    }),
  )
  const activeTileLayers = tileLayers.filter((l) =>
    l.layer_presentations.some(
      (lp) => lp.tile_layer_id === l.tile_layer_id && lp.active,
    ),
  )

  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where,
      include: { layer_presentations: true },
    }),
  )
  const activeVectorLayers = vectorLayers.filter((l) =>
    l.layer_presentations.some(
      (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
    ),
  )

  // TODO: test
  // sort by app_states.map_layer_sorting
  const activeLayers = [...activeTileLayers, ...activeVectorLayers].sort(
    (a, b) => {
      const aIndex = layerSorting.findIndex(
        (ls) =>
          ls.layer_presentations?.[0]?.layer_presentation_id ===
          a.layer_presentations?.[0]?.layer_presentation_id,
      )
      const bIndex = layerSorting.findIndex(
        (ls) =>
          ls.layer_presentations?.[0]?.layer_presentation_id ===
          b.layer_presentations?.[0]?.layer_presentation_id,
      )
      return aIndex - bIndex
    },
  )
  const layerPresentationIds = activeLayers.map(
    (l) => l.layer_presentations?.[0]?.layer_presentation_id,
  )
  console.log('Map.Layers.Actives', {
    layerSorting,
    layerPresentationIds,
    activeLayers,
  })

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
      console.log('Map.Layers.Actives.useEffect', {
        layerPresentationIds,
        missingLayerPresentations,
        removeLayerPresentations,
        newLayerSorting,
      })
      await db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: {
          map_layer_sorting: newLayerSorting,
        },
      })
    }
    run()
  }, [appState, db.app_states, layerPresentationIds, layerSorting])

  return (
    <ErrorBoundary>
      <section>
        <h2 style={titleStyle}>Active</h2>
        <div style={layerListStyle}>
          <Accordion multiple collapsible>
            {activeLayers.length ? (
              activeLayers?.map((l, index) => (
                <ActiveLayer
                  key={l.tile_layer_id ?? l.vector_layer_id}
                  layer={l}
                  isLast={index === activeLayers.length - 1}
                />
              ))
            ) : (
              <p style={noLayersStyle}>No active layers</p>
            )}
          </Accordion>
        </div>
      </section>
    </ErrorBoundary>
  )
})
