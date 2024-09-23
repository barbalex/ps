import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Accordion } from '@fluentui/react-components'
import { useAtom, atom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { OwnLayer } from './OwnLayer.tsx'
import {
  sectionStyle,
  layerListStyle,
  titleStyle,
  noneStyle,
} from '../styles.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom([])

export const OwnLayers = memo(() => {
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const { project_id } = useParams()

  const { db } = useElectric()!
  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: {
        type: { notIn: ['wfs', 'upload'] },
        ...(project_id ? { project_id } : {}),
      },
      // TODO: this only returns vector layers that have a presentation
      // https://github.com/electric-sql/electric/issues/1417
      include: { layer_presentations: true },
    }),
  )

  // 2. when one is set active, add layer_presentations for it
  const own = vectorLayers.filter(
    (l) =>
      !(l.layer_presentations ?? []).some(
        (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
      ),
  )

  const onChange = useCallback(
    async (layer) => {
      db.layer_presentations.update({
        where: {
          layer_presentation_id:
            layer.layer_presentations?.[0]?.layer_presentation_id,
        },
        data: { active: true },
      })
    },
    [db],
  )

  const onToggleItem = useCallback(
    (event, { value: layerPresentationId, openItems }) => {
      // use setTimeout to let the child checkbox set the layers active status
      setTimeout(async () => {
        // fetch layerPresentation's active status
        const layerPresentation = await db.layer_presentations.findFirst({
          where: { layer_presentation_id: layerPresentationId },
        })
        const isActive = layerPresentation?.active
        if (!isActive) {
          // if not active, remove this item
          const newOpenItems = openItems.filter(
            (id) => id !== layerPresentationId,
          )
          setOpenItems(newOpenItems)
          return
        }
        setOpenItems(openItems)
      })
    },
    [db.layer_presentations, setOpenItems],
  )

  if (!project_id) {
    return (
      <section style={sectionStyle}>
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
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Own</h2>
        <div style={layerListStyle}>
          <Accordion
            multiple
            collapsible
            openItems={openItems}
            onToggle={onToggleItem}
          >
            {own.length ? (
              own.map((l, index) => (
                <OwnLayer
                  key={l.vector_layer_id}
                  layer={l}
                  onChange={onChange}
                  isLast={index === own.length - 1}
                />
              ))
            ) : (
              <p style={noneStyle}>No inactive Own Layers</p>
            )}
          </Accordion>
        </div>
      </section>
    </ErrorBoundary>
  )
})
