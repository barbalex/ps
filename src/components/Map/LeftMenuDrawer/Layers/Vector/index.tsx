import { useParams } from '@tanstack/react-router'
import { Button, Accordion } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useAtom, atom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { VectorLayer } from './VectorLayer.tsx'
import { createVectorLayer } from '../../../../../modules/createRows.ts'
import layerStyles from '../index.module.css'
import type LayerPresentations from '../../../../../models/public/LayerPresentations.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

// TODO: this component re-renders indefinitely
export const VectorLayers = () => {
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const db = usePGlite()

  const sql = `
    SELECT 
      vl.*,
      json_agg(
        json_build_object(
          'layer_presentation_id', lp.layer_presentation_id,
          'active', lp.active
        )
      ) FILTER (WHERE lp.layer_presentation_id IS NOT NULL) AS layer_presentations
    FROM vector_layers vl
    LEFT JOIN layer_presentations lp ON vl.vector_layer_id = lp.vector_layer_id
    WHERE
      vl.type = ANY('{wfs,upload}')
      AND vl.project_id = $1
      AND NOT EXISTS (
        SELECT 1
        FROM layer_presentations lp2
        WHERE lp2.vector_layer_id = vl.vector_layer_id
        AND lp2.active
      )
    GROUP BY vl.vector_layer_id
    ORDER BY vl.label`
  const res = useLiveQuery(sql, [projectId])
  const vectorLayerIds: { vector_layer_id: string }[] = res?.rows ?? []

  const addRow = async () => {
    const vectorLayerId = await createVectorLayer({ projectId, type: 'wfs' })
    setOpenItems([openItems, vectorLayerId])
  }

  const onToggleItem = (event, { value: vectorLayerId, openItems }) => {
    // use setTimeout to let the child checkbox set the layers active status
    setTimeout(async () => {
      // fetch layerPresentation's active status
      const res = await db.query(
        `SELECT active FROM layer_presentations WHERE vector_layer_id = $1`,
        [vectorLayerId],
      )
      const isActive: LayerPresentations['active'] | undefined =
        res?.rows?.[0]?.active
      if (isActive) {
        // if not active, remove this item
        const newOpenItems = openItems.filter((id) => id !== vectorLayerId)
        setOpenItems(newOpenItems)
        return
      }
      setOpenItems(openItems)
    }, 200)
  }

  if (projectId === '99999999-9999-9999-9999-999999999999') {
    return (
      <section>
        <h2 className={layerStyles.title}>Vectors</h2>
        <div className={layerStyles.layerList}>
          <p className={layerStyles.none}>
            Vector Layers are accessible when a project is active
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
        <h2 className={layerStyles.title}>Vectors</h2>
        <Accordion
          multiple
          collapsible
          openItems={openItems}
          onToggle={onToggleItem}
        >
          {vectorLayerIds.length ?
            vectorLayerIds.map((l, index) => (
              <VectorLayer
                layer={l}
                key={l.vector_layer_id}
                isLast={index === vectorLayerIds.length - 1}
                isOpen={openItems.includes(l.vector_layer_id)}
              />
            ))
          : <p className={layerStyles.none}>No inactive Vector Layers</p>}
          <Button
            size="small"
            icon={<FaPlus />}
            onClick={addRow}
            title="Add vector layer"
            className={layerStyles.addButton}
          />
        </Accordion>
      </section>
    </ErrorBoundary>
  )
}
