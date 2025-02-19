import { memo, useCallback } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'
import { Button, Accordion } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useAtom, atom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import {
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

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

export const WmsLayers = memo(() => {
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const { project_id } = useParams()

  const db = usePGlite()
  // 1. list all layers (own, wms, vector)
  const where = project_id ? { project_id } : {}
  const { results: wmsLayers = [] } = useLiveQuery(
    db.wms_layers.liveMany({
      where,
      include: { layer_presentations: true },
      orderBy: { label: 'asc' },
    }),
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
    await createLayerPresentation({
      wms_layer_id: wmsLayer.wms_layer_id,
      db,
    })
    setOpenItems((prev) => [...prev, wmsLayer.wms_layer_id])
  }, [db, project_id, setOpenItems])

  const onToggleItem = useCallback(
    (event, { value: wmsLayerId, openItems }) => {
      // use setTimeout to let the child checkbox set the layers active status
      setTimeout(async () => {
        // fetch layerPresentation's active status
        const layerPresentation = await db.layer_presentations.findFirst({
          where: { wms_layer_id: wmsLayerId },
        })
        const isActive = layerPresentation?.active
        if (isActive) {
          // if not active, remove this item
          const newOpenItems = openItems.filter((id) => id !== wmsLayerId)
          setOpenItems(newOpenItems)
          return
        }
        setOpenItems(openItems)
      }, 200)
    },
    [db.layer_presentations, setOpenItems],
  )

  if (!project_id) {
    return (
      <section>
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
      <section>
        <h2 style={titleStyle}>WMS</h2>
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
                isOpen={openItems.includes(l.wms_layer_id)}
              />
            ))
          ) : (
            <p style={noneStyle}>No inactive WMS Layers</p>
          )}
          <Button
            size="small"
            icon={<FaPlus />}
            onClick={addRow}
            title="Add WMS layer"
            style={addButtonStyle}
          />
        </Accordion>
      </section>
    </ErrorBoundary>
  )
})
