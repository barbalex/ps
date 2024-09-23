import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Button, Accordion } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useAtom, atom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import {
  sectionStyle,
  layerListStyle,
  titleStyle,
  noneStyle,
  addButtonStyle,
} from '../styles.ts'
import { WmsLayer } from './WmsLayer.tsx'
import {
  createWmsLayer,
  createLayerPresentation,
} from '../../../../../modules/createRows.ts'
import { designingAtom } from '../../../../../store.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

export const WmsLayers = memo(() => {
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const [designing] = useAtom(designingAtom)
  const { project_id } = useParams()

  const { db } = useElectric()!
  // 1. list all layers (own, wms, vector)
  const where = project_id ? { project_id } : {}
  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const { results: wmsLayers = [] } = useLiveQuery(
    db.wms_layers.liveMany({ where, orderBy: { label: 'asc' } }),
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
    setOpenItems((prev) => [...prev, wmsLayer.wms_layer_id])
  }, [db.layer_presentations, db.wms_layers, project_id, setOpenItems])

  const onToggleItem = useCallback(
    (event, { openItems }) => setOpenItems(openItems),
    [setOpenItems],
  )

  if (!project_id) {
    return (
      <section style={sectionStyle}>
        <h2 style={titleStyle}>WMS</h2>
        <div style={layerListStyle}>
          <div style={layerListStyle}></div>
          <p style={noneStyle}>
            WMS Layers are accessible when a project is active
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
      <section style={sectionStyle}>
        <h2 style={titleStyle}>WMS</h2>
        <div style={layerListStyle}>
          <Accordion
            multiple
            collapsible
            openItems={openItems}
            onToggle={onToggleItem}
          >
            {wms.length ? (
              wms?.map((l, index) => (
                <WmsLayer
                  key={l.wms_layer_id}
                  layer={l}
                  layerPresentations={layerPresentations}
                  isLast={index === wms.length - 1}
                />
              ))
            ) : (
              <p style={noneStyle}>No inactive WMS Layers</p>
            )}
            {designing && (
              <Button
                size="small"
                icon={<FaPlus />}
                onClick={addRow}
                title="Add WMS layer"
                style={addButtonStyle}
              />
            )}
          </Accordion>
        </div>
      </section>
    </ErrorBoundary>
  )
})
