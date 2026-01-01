import { useParams } from '@tanstack/react-router'
import { Accordion } from '@fluentui/react-components'
import { useAtom, atom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { OwnLayer } from './OwnLayer.tsx'
import layerStyles from '../index.module.css'
import type VectorLayers from '../../../../models/public/VectorLayers.ts'
import type LayerPresentations from '../../../../../models/public/LayerPresentations.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

export const OwnLayers = () => {
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const db = usePGlite()
  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const res = useLiveQuery(
    `
    SELECT * 
    FROM vector_layers 
    WHERE
      type NOT IN ('wfs', 'upload')
      AND project_id = $1
      AND EXISTS (
        SELECT 1
        FROM layer_presentations
        WHERE 
          layer_presentations.vector_layer_id = vector_layers.vector_layer_id
          AND layer_presentations.active
      )
    ORDER BY label
  `,
    [projectId],
  )
  const ownVectorLayers: VectorLayers[] = res?.rows ?? []

  const onToggleItem = (event, { value: vectorLayerId, openItems }) => {
    // use setTimeout to let the child checkbox set the layers active status
    setTimeout(async () => {
      // fetch layerPresentation's active status
      const res = await db.query(
        `SELECT active FROM layer_presentations WHERE vector_layer_id = $1`,
        [vectorLayerId],
      )
      const isActive: LayerPresentations['active'] = res?.rows?.[0]?.active
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
        <h2 className={layerStyles.title}>Own</h2>
        <div className={layerStyles.layerList}>
          <p className={layerStyles.none}>
            Own Layers are accessible when a project is active
          </p>
        </div>
      </section>
    )
  }

  return (
    <ErrorBoundary>
      <section>
        <h2 className={layerStyles.title}>Own</h2>
        <Accordion
          multiple
          collapsible
          openItems={openItems}
          onToggle={onToggleItem}
        >
          {ownVectorLayers.length ? (
            ownVectorLayers.map((l, index) => (
              <OwnLayer
                key={l.vector_layer_id}
                layer={l}
                isLast={index === ownVectorLayers.length - 1}
                isOpen={openItems.includes(l.vector_layer_id)}
              />
            ))
          ) : (
            <p className={layerStyles.none}>No inactive Own Layers</p>
          )}
        </Accordion>
      </section>
    </ErrorBoundary>
  )
}
