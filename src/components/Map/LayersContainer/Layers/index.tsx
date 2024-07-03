import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
// import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'
import { Checkbox } from '@fluentui/react-components'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { createLayerPresentation } from '../../../../modules/createRows.ts'
import { ActiveLayers } from './Actives/index.tsx'

const formStyle = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingBottom: 10,
  // enable scrolling
  overflowY: 'auto',
  height: '100%',
}
const layerListStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}

export const Layers = memo(({ isNarrow }) => {
  const { project_id } = useParams()
  // const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  // 1. list all layers (own, tile, vector)
  const where = project_id ? { project_id } : {}
  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where,
      // include: { layer_presentations: true },
    }),
  )
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where,
      // TODO: this only returns vector layers that have a presentation
      // https://github.com/electric-sql/electric/issues/1417
      // include: { layer_presentations: true },
    }),
  )
  // fetch all layer_presentations for the vector layers
  const { results: layerPresentations = [] } = useLiveQuery(
    db.layer_presentations.liveMany({
      where: {
        OR: [
          {
            vector_layer_id: { in: vectorLayers.map((l) => l.vector_layer_id) },
          },
          { tile_layer_id: { in: tileLayers.map((l) => l.tile_layer_id) } },
        ],
      },
    }),
  )
  // 2. when one is set active, add layer_presentations for it

  const tiles = tileLayers.filter(
    (l) =>
      !layerPresentations.some(
        (lp) => lp.tile_layer_id === l.tile_layer_id && lp.active,
      ),
  )
  const own = vectorLayers
    .filter((v) => v.type !== 'wfs')
    .filter(
      (l) =>
        !layerPresentations.some(
          (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
        ),
    )
  const vectors = vectorLayers
    .filter((v) => v.type === 'wfs')
    .filter(
      (l) =>
        !layerPresentations.some(
          (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
        ),
    )

  const onChangeNonActive = useCallback(
    async (layer) => {
      // 1. check if layer has a presentation
      const presentation = await db.layer_presentations.findFirst({
        where: {
          ...(layer.tile_layer_id
            ? { tile_layer_id: layer.tile_layer_id }
            : {}),
          ...(layer.vector_layer_id
            ? { vector_layer_id: layer.vector_layer_id }
            : {}),
        },
      })
      // 2. if not, create one
      if (!presentation) {
        const data = createLayerPresentation({
          ...(layer.tile_layer_id
            ? { tile_layer_id: layer.tile_layer_id }
            : {}),
          ...(layer.vector_layer_id
            ? { vector_layer_id: layer.vector_layer_id }
            : {}),
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
    },
    [db],
  )

  return (
    <ErrorBoundary>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...(isNarrow ? { marginTop: 5 } : { marginRight: 5 }),
        }}
      >
        <FormHeader
          title="Layers"
          titleMarginLeft={isNarrow ? 34 : undefined}
        />
        <div style={formStyle}>
          <ActiveLayers />
          <h2>Tiled</h2>
          <div style={layerListStyle}>
            {tiles.length ? (
              tiles?.map((l) => (
                <Checkbox
                  key={l.tile_layer_id}
                  size="large"
                  label={l.label}
                  // checked if layer has an active presentation
                  checked={
                    !!layerPresentations.find(
                      (lp) => lp.tile_layer_id === l.tile_layer_id && lp.active,
                    )
                  }
                  onChange={() => onChangeNonActive(l)}
                />
              ))
            ) : (
              <p>No tile layers</p>
            )}
          </div>
          <h2>Vectors</h2>
          <div style={layerListStyle}>
            {vectors.length ? (
              vectors.map((l) => (
                <Checkbox
                  key={l.vector_layer_id}
                  size="large"
                  label={l.label}
                  // checked if layer has an active presentation
                  checked={
                    !!layerPresentations.find(
                      (lp) =>
                        lp.vector_layer_id === l.vector_layer_id && lp.active,
                    )
                  }
                  onChange={() => onChangeNonActive(l)}
                />
              ))
            ) : (
              <p>No vector layers</p>
            )}
          </div>
          <h2>Own</h2>
          <div style={layerListStyle}>
            {own.length ? (
              own.map((l) => (
                <Checkbox
                  key={l.vector_layer_id}
                  size="large"
                  label={l.label}
                  // checked if layer has an active presentation
                  checked={
                    !!layerPresentations.find(
                      (lp) =>
                        lp.vector_layer_id === l.vector_layer_id && lp.active,
                    )
                  }
                  onChange={() => onChangeNonActive(l)}
                />
              ))
            ) : (
              <p>No own layers</p>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
})
