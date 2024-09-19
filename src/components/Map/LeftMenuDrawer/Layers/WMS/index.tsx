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
} from '../styles.ts'
import { WmsLayer } from './WmsLayer.tsx'
import {
  createWmsLayer,
  createLayerPresentation,
} from '../../../../../modules/createRows.ts'
import { mapEditingWmsLayerAtom } from '../../../../../store.ts'

export const WmsLayers = memo(() => {
  const [, setEditingWmsLayer] = useAtom(mapEditingWmsLayerAtom)
  const { project_id } = useParams()

  const { db } = useElectric()!
  // 1. list all layers (own, wms, vector)
  const where = project_id ? { project_id } : {}
  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const { results: wmsLayers = [] } = useLiveQuery(
    db.wms_layers.liveMany({ where }),
  )

  // fetch all layer_presentations for the vector layers
  const { results: layerPresentations = [] } = useLiveQuery(
    db.layer_presentations.liveMany({
      where: {
        wms_layer_id: { in: wmsLayers.map((l) => l.wms_layer_id) },
      },
    }),
  )
  // 2. when one is set active, add layer_presentations for it

  const wms = wmsLayers.filter(
    (l) =>
      !layerPresentations.some(
        (lp) => lp.wms_layer_id === l.wms_layer_id && lp.active,
      ),
  )

  const addRow = useCallback(async () => {
    const wmsLayer = createWmsLayer({ project_id })
    await db.wms_layers.create({ data: wmsLayer })
    // also add layer_presentation
    const layerPresentation = createLayerPresentation({
      wms_layer_id: wmsLayer.wms_layer_id,
    })
    await db.layer_presentations.create({ data: layerPresentation })
    setEditingWmsLayer(wmsLayer.wms_layer_id)
  }, [db.layer_presentations, db.wms_layers, project_id, setEditingWmsLayer])

  return (
    <ErrorBoundary>
      <section style={sectionStyle}>
        <h2 style={titleStyle}>WMS</h2>
        <div style={layerListStyle}>
          {wms.length ? (
            wms?.map((l) => (
              <WmsLayer
                key={l.wms_layer_id}
                layer={l}
                layerPresentations={layerPresentations}
              />
            ))
          ) : (
            <p style={noneStyle}>No inactive WMS Layers</p>
          )}
          <Button
            size="medium"
            icon={<FaPlus />}
            onClick={addRow}
            title={`Add new WMS-Layer`}
          />
        </div>
      </section>
    </ErrorBoundary>
  )
})
