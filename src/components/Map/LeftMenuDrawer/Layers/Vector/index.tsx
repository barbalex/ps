import { memo, useCallback } from 'react'
import { useParams } from '@tanstack/react-router'
import { Button, Accordion } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useAtom, atom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import {
  layerListStyle,
  titleStyle,
  noneStyle,
  addButtonStyle,
} from '../styles.ts'
import { VectorLayer } from './VectorLayer.tsx'
import {
  createVectorLayer,
  createLayerPresentation,
  createVectorLayerDisplay,
} from '../../../../../modules/createRows.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

// TODO: this component re-renders indefinitely
export const VectorLayers = memo(() => {
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const { projectId } = useParams({ strict: false })

  const db = usePGlite()

  const sql = `
    SELECT vector_layer_id
    FROM vector_layers
    WHERE
      type = ANY('{wfs,upload}')
      ${projectId ? `AND project_id = '${projectId}'` : ''}
      AND NOT EXISTS (
        SELECT 1
        FROM layer_presentations
        WHERE layer_presentations.vector_layer_id = vector_layers.vector_layer_id
        AND layer_presentations.active
      )
    ORDER BY label`
  const res = useLiveQuery(sql)
  const vectors = res?.rows ?? []

  const addRow = useCallback(async () => {
    const res = await createVectorLayer({ projectId, type: 'wfs', db })
    const vectorLayer = res?.rows?.[0]
    // also add vector_layer_display
    await createVectorLayerDisplay({
      vectorLayerId: vectorLayer.vector_layer_id,
      db,
    })
    // also add layer_presentation
    await createLayerPresentation({
      vectorLayerId: vectorLayer.vector_layer_id,
      db,
    })
    setOpenItems([openItems, vectorLayer.vector_layer_id])
  }, [db, openItems, projectId, setOpenItems])

  const onToggleItem = useCallback(
    (event, { value: vectorLayerId, openItems }) => {
      // use setTimeout to let the child checkbox set the layers active status
      setTimeout(async () => {
        // fetch layerPresentation's active status
        const res = await db.query(
          `SELECT active FROM layer_presentations WHERE vector_layer_id = $1`,
          [vectorLayerId],
        )
        const isActive = res?.rows?.[0]?.active
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

  if (!projectId) {
    return (
      <section>
        <h2 style={titleStyle}>Vectors</h2>
        <div style={layerListStyle}>
          <p style={noneStyle}>
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
        <h2 style={titleStyle}>Vectors</h2>
        <Accordion
          multiple
          collapsible
          openItems={openItems}
          onToggle={onToggleItem}
        >
          {vectors.length ?
            vectors.map((l, index) => (
              <VectorLayer
                layer={l}
                key={l.vector_layer_id}
                isLast={index === vectors.length - 1}
                isOpen={openItems.includes(l.vector_layer_id)}
              />
            ))
          : <p style={noneStyle}>No inactive Vector Layers</p>}
          <Button
            size="small"
            icon={<FaPlus />}
            onClick={addRow}
            title="Add vector layer"
            style={addButtonStyle}
          />
        </Accordion>
      </section>
    </ErrorBoundary>
  )
})
