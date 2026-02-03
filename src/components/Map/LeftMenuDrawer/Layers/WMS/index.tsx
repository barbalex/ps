import { useParams } from '@tanstack/react-router'
import { Button, Accordion } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useAtom, atom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { WmsLayer } from './WmsLayer.tsx'
import {
  createWmsLayer,
  createLayerPresentation,
} from '../../../../../modules/createRows.ts'
import layerStyles from '../index.module.css'
import type WMSLayers from '../../../../models/public/WMSLayers.ts'
import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

export const WmsLayers = () => {
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const db = usePGlite()
  // 1. list all layers (own, wms, vector)

  // TODO: optimize query
  const resWmsLayers = useLiveQuery(
    `
    SELECT * FROM wms_layers
    WHERE project_id = $1
    ORDER BY label`,
    [projectId],
  )
  const wmsLayers: WMSLayers[] = resWmsLayers?.rows ?? []

  // fetch all layer_presentations for the vector layers
  const resLP = useLiveQuery(
    `
    SELECT lp.* 
    FROM layer_presentations lp
      JOIN wms_layers wms ON lp.wms_layer_id = wms.wms_layer_id
    WHERE wms.project_id = $1`,
    [projectId],
  )
  const layerPresentations: LayerPresentations[] = resLP?.rows ?? []
  // 2. when one is set active, add layer_presentations for it
  const wms = wmsLayers.filter(
    (l) =>
      !layerPresentations.some(
        (lp) => lp.wms_layer_id === l.wms_layer_id && lp.active,
      ),
  )

  const addRow = async () => {
    const wmsLayerId = await createWmsLayer({ projectId })
    // also add layer_presentation
    await createLayerPresentation({
      wmsLayerId,
    })
    setOpenItems((prev) => [...prev, wmsLayerId])
  }

  const onToggleItem = (event, { value: wmsLayerId, openItems }) => {
    // use setTimeout to let the child checkbox set the layers active status
    setTimeout(async () => {
      // fetch layerPresentation's active status
      const res = await db.query(
        `SELECT active FROM layer_presentations WHERE wms_layer_id = $1`,
        [wmsLayerId],
      )
      const isActive: LayerPresentations['active'] | undefined =
        res?.rows?.[0]?.active
      if (isActive) {
        // if not active, remove this item
        const newOpenItems = openItems.filter((id) => id !== wmsLayerId)
        setOpenItems(newOpenItems)
        return
      }
      setOpenItems(openItems)
    }, 200)
  }

  if (projectId === '99999999-9999-9999-9999-999999999999') {
    return (
      <section>
        <h2 className={layerStyles.title}>WMS</h2>
        <div className={layerStyles.layerList}>
          <div className={layerStyles.layerList}></div>
          <p className={layerStyles.none}>
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
        <h2 className={layerStyles.title}>WMS</h2>
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
          : <p className={layerStyles.none}>No inactive WMS Layers</p>}
          <Button
            size="small"
            icon={<FaPlus />}
            onClick={addRow}
            title="Add WMS layer"
            className={layerStyles.addButton}
          />
        </Accordion>
      </section>
    </ErrorBoundary>
  )
}
