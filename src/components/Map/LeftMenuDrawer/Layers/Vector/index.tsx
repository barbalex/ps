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
import { VectorLayer } from './VectorLayer.tsx'
import {
  createVectorLayer,
  createLayerPresentation,
  createVectorLayerDisplay,
} from '../../../../../modules/createRows.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

export const VectorLayers = memo(() => {
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const { project_id } = useParams()

  const db = usePGlite()

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
      // order by label
      orderBy: { label: 'asc' },
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
    const vectorLayer = createVectorLayer({ project_id, type: 'wfs' })
    await db.vector_layers.create({ data: vectorLayer })
    // also add vector_layer_display
    await createVectorLayerDisplay({
      vector_layer_id: vectorLayer.vector_layer_id,
    })
    // also add layer_presentation
    await createLayerPresentation({
      vector_layer_id: vectorLayer.vector_layer_id,
      db,
    })
    setOpenItems([openItems, vectorLayer.vector_layer_id])
  }, [db, openItems, project_id, setOpenItems])

  const onToggleItem = useCallback(
    (event, { value: vectorLayerId, openItems }) => {
      // use setTimeout to let the child checkbox set the layers active status
      setTimeout(async () => {
        // fetch layerPresentation's active status
        const layerPresentation = await db.layer_presentations.findFirst({
          where: { vector_layer_id: vectorLayerId },
        })
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
    [db.layer_presentations, setOpenItems],
  )

  if (!project_id) {
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
          {vectors.length ? (
            vectors.map((l, index) => (
              <VectorLayer
                layer={l}
                key={l.vector_layer_id}
                isLast={index === vectors.length - 1}
                isOpen={openItems.includes(l.vector_layer_id)}
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
        </Accordion>
      </section>
    </ErrorBoundary>
  )
})
