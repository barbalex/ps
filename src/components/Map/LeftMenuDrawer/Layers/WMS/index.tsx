import { memo, useCallback } from 'react'
import { useParams } from 'react-router'
import { Button, Accordion } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useAtom, atom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

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
  const { projectId } = useParams()

  const db = usePGlite()
  // 1. list all layers (own, wms, vector)

  // TODO: optimize query
  const resWmsLayers = useLiveIncrementalQuery(
    `SELECT * FROM wms_layers${
      projectId ? ` WHERE project_id = $1` : ''
    } ORDER BY label`,
    [projectId],
    'wms_layer_id',
  )
  const wmsLayers = resWmsLayers?.rows ?? []

  // fetch all layer_presentations for the vector layers
  const resLP = useLiveIncrementalQuery(
    `
    SELECT lp.* FROM layer_presentations lp
    JOIN wms_layers wms ON lp.wms_layer_id = wms.wms_layer_id
    ${projectId ? ` WHERE project_id = $1` : ''}`,
    [projectId],
    'layer_presentation_id',
  )
  const layerPresentations = resLP?.rows ?? []
  // 2. when one is set active, add layer_presentations for it
  const wms = wmsLayers.filter(
    (l) =>
      !layerPresentations.some(
        (lp) => lp.wms_layer_id === l.wms_layer_id && lp.active,
      ),
  )

  const addRow = useCallback(async () => {
    const res = await createWmsLayer({ projectId, db })
    const wmsLayer = res?.rows?.[0]
    // also add layer_presentation
    await createLayerPresentation({
      wmsLayerId: wmsLayer.wms_layer_id,
      db,
    })
    setOpenItems((prev) => [...prev, wmsLayer.wms_layer_id])
  }, [db, projectId, setOpenItems])

  const onToggleItem = useCallback(
    (event, { value: wmsLayerId, openItems }) => {
      // use setTimeout to let the child checkbox set the layers active status
      setTimeout(async () => {
        // fetch layerPresentation's active status
        const res = await db.query(
          `SELECT active FROM layer_presentations WHERE wms_layer_id = $1`,
          [wmsLayerId],
        )
        const layerPresentation = res?.rows?.[0]
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
    [db, setOpenItems],
  )

  if (!projectId) {
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
          {wms.length ?
            wms?.map((l, index) => (
              <WmsLayer
                key={l.wms_layer_id}
                layer={l}
                layerPresentations={layerPresentations}
                isLast={index === wms.length - 1}
                isOpen={openItems.includes(l.wms_layer_id)}
              />
            ))
          : <p style={noneStyle}>No inactive WMS Layers</p>}
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
