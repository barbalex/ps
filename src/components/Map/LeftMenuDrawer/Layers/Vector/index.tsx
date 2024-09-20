import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import {
  sectionStyle,
  layerListStyle,
  titleStyle,
  noneStyle,
  addButtonStyle,
} from '../styles.ts'
import { VectorLayer } from './VectorLayer.tsx'
import {
  createVectorLayer,
  createLayerPresentation,
} from '../../../../../modules/createRows.ts'
import { mapEditingVectorLayerAtom } from '../../../../../store.ts'

export const VectorLayers = memo(() => {
  const [, setEditingVectorLayer] = useAtom(mapEditingVectorLayerAtom)
  const { project_id } = useParams()

  const { db } = useElectric()!

  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: {
        type: { in: ['wfs', 'upload'] },
        ...(project_id ? { project_id } : {}),
      },
      // TODO: this only returns vector layers that have a presentation
      // https://github.com/electric-sql/electric/issues/1417
      include: { layer_presentations: true },
    }),
  )

  // 2. when one is set active, add layer_presentations for it
  const vectors = vectorLayers.filter(
    (l) =>
      !(l.layer_presentations ?? []).some(
        (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
      ),
  )

  const addRow = useCallback(async () => {
    console.log('project_id', project_id)
    const vectorLayer = createVectorLayer({ project_id })
    console.log('vectorLayer', vectorLayer)
    const res1 = await db.vector_layers.create({ data: vectorLayer })
    console.log('res1', res1)
    // also add layer_presentation
    const layerPresentation = createLayerPresentation({
      vector_layer_id: vectorLayer.vector_layer_id,
    })
    console.log('layerPresentation', layerPresentation)
    const res2 = await db.layer_presentations.create({
      data: layerPresentation,
    })
    console.log('res2', res2)
    setEditingVectorLayer(vectorLayer.vector_layer_id)
  }, [
    db.layer_presentations,
    db.vector_layers,
    project_id,
    setEditingVectorLayer,
  ])

  if (!project_id) {
    return (
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Vectors</h2>
        <div style={layerListStyle}>
          <p style={noneStyle}>
            Vector Layers are accessible when a project is active
          </p>
        </div>
      </section>
    )
  }

  return (
    <ErrorBoundary>
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Vectors</h2>
        <div style={layerListStyle}>
          {vectors.length ? (
            vectors.map((l) => (
              <VectorLayer
                layer={l}
                key={l.vector_layer_id}
              />
            ))
          ) : (
            <p style={noneStyle}>No inactive Vector Layers</p>
          )}
          <Button
            size="small"
            icon={<FaPlus />}
            onClick={addRow}
            title="Add vector layer"
            style={addButtonStyle}
          />
        </div>
      </section>
    </ErrorBoundary>
  )
})
