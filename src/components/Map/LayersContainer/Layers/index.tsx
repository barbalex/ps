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
import { WmsLayers } from './WMS.tsx'
import { VectorLayers } from './Vector.tsx'
import {
  sectionStyle,
  layerListStyle,
  titleStyle,
  noneStyle,
} from './styles.ts'

const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
}

const formStyle = {
  // enable scrolling
  overflowY: 'auto',
  height: '100%',
}

export const Layers = memo(({ isNarrow }) => {
  const { project_id } = useParams()
  // const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  // 1. list all layers (own, wms, vector)
  const where = project_id ? { project_id } : {}
  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
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
        vector_layer_id: { in: vectorLayers.map((l) => l.vector_layer_id) },
      },
    }),
  )
  // 2. when one is set active, add layer_presentations for it

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
        where: { vector_layer_id: layer.vector_layer_id },
      })
      // 2. if not, create one
      if (!presentation) {
        const data = createLayerPresentation({
          vector_layer_id: layer.vector_layer_id,
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
          ...containerStyle,
          ...(isNarrow ? { marginTop: 5 } : { marginRight: 5 }),
        }}
      >
        <FormHeader
          title="Layers"
          titleMarginLeft={isNarrow ? 34 : undefined}
        />
        <div style={formStyle}>
          <ActiveLayers isNarrow={isNarrow} />
          <WmsLayers />
          <VectorLayers />
          <section style={sectionStyle}>
            <h2 style={titleStyle}>Vectors</h2>
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
                <p style={noneStyle}>No inactive Vector Layers</p>
              )}
            </div>
          </section>
          <section style={sectionStyle}>
            <h2 style={titleStyle}>Own</h2>
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
                <p style={noneStyle}>No inactive Own Layers</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </ErrorBoundary>
  )
})
