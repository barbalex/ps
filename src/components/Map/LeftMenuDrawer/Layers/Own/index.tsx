import { memo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Accordion } from '@fluentui/react-components'
import { useAtom, atom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { OwnLayer } from './OwnLayer.tsx'
import { layerListStyle, titleStyle, noneStyle } from '../styles.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

export const OwnLayers = memo(() => {
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const { project_id } = useParams()

  const db = usePGlite()
  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const res = useLiveIncrementalQuery(
    `
    SELECT * 
    FROM vector_layers 
    WHERE
      type NOT IN ('wfs', 'upload')
      ${project_id ? `AND project_id = '${project_id}'` : ''}
      AND EXISTS (
        SELECT 1
        FROM layer_presentations
        WHERE 
          layer_presentations.vector_layer_id = vector_layers.vector_layer_id
          AND layer_presentations.active
      )
    ORDER BY label ASC
  `,
    undefined,
    'vector_layer_id',
  )
  const ownVectorLayers = res?.rows ?? []

  const onToggleItem = useCallback(
    (event, { value: vectorLayerId, openItems }) => {
      // use setTimeout to let the child checkbox set the layers active status
      setTimeout(async () => {
        // fetch layerPresentation's active status
        const res = await db.query(
          `SELECT active FROM layer_presentations WHERE vector_layer_id = $1`,
          [vectorLayerId],
        )
        const layerPresentation = res?.rows?.[0]
        const isActive = layerPresentation?.active
        if (isActive) {
          // if not active, remove this item
          const newOpenItems = openItems.filter((id) => id !== vectorLayerId)
          setOpenItems(newOpenItems)
          return
        }
        setOpenItems(openItems)
      }, 200)
    },
    [db, setOpenItems],
  )

  if (!project_id) {
    return (
      <section>
        <h2 style={titleStyle}>Own</h2>
        <div style={layerListStyle}>
          <p style={noneStyle}>
            Own Layers are accessible when a project is active
          </p>
        </div>
      </section>
    )
  }

  return (
    <ErrorBoundary>
      <section>
        <h2 style={titleStyle}>Own</h2>
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
            <p style={noneStyle}>No inactive Own Layers</p>
          )}
        </Accordion>
      </section>
    </ErrorBoundary>
  )
})
