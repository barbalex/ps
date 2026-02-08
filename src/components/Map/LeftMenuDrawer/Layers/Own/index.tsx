import { useParams } from '@tanstack/react-router'
import { Accordion } from '@fluentui/react-components'
import { useAtom, atom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useState, useEffect } from 'react'

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
  // Show table-based vector layers that are not currently active
  const res = useLiveQuery(
    `
    SELECT * 
    FROM vector_layers 
    WHERE
      own_table IS NOT NULL
      AND project_id = $1
      AND NOT EXISTS (
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

  // Filter out table layers that have no geometries
  const [ownVectorLayers, setOwnVectorLayers] = useState<VectorLayers[]>([])

  useEffect(() => {
    const filterLayers = async () => {
      const ownVectorLayersRaw = res?.rows ?? []
      const filtered = []
      for (const layer of ownVectorLayersRaw) {
        const tableName = layer.own_table_level
          ? `${layer.own_table}${layer.own_table_level}`
          : layer.own_table

        let hasGeometries = false

        // Check based on table type
        if (tableName.startsWith('places')) {
          const level = layer.own_table_level
          const countRes = await db.query(
            `SELECT COUNT(*) FROM places p 
             INNER JOIN subprojects s ON p.subproject_id = s.subproject_id 
             WHERE s.project_id = $1 
             AND p.geometry IS NOT NULL
             ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
            [projectId],
          )
          hasGeometries = countRes?.rows?.[0]?.count > 0
        } else if (tableName.startsWith('actions')) {
          const level = layer.own_table_level
          const countRes = await db.query(
            `SELECT COUNT(*) FROM actions a 
             INNER JOIN places p ON a.place_id = p.place_id 
             INNER JOIN subprojects s ON p.subproject_id = s.subproject_id 
             WHERE s.project_id = $1 
             AND a.geometry IS NOT NULL
             ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
            [projectId],
          )
          hasGeometries = countRes?.rows?.[0]?.count > 0
        } else if (tableName.startsWith('checks')) {
          const level = layer.own_table_level
          const countRes = await db.query(
            `SELECT COUNT(*) FROM checks c 
             INNER JOIN places p ON c.place_id = p.place_id 
             INNER JOIN subprojects s ON p.subproject_id = s.subproject_id 
             WHERE s.project_id = $1 
             AND c.geometry IS NOT NULL
             ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
            [projectId],
          )
          hasGeometries = countRes?.rows?.[0]?.count > 0
        } else if (tableName.startsWith('occurrences_assigned')) {
          const level = layer.own_table_level
          const countRes = await db.query(
            `SELECT COUNT(*) FROM occurrences o 
             INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id 
             INNER JOIN places p ON o.place_id = p.place_id 
             INNER JOIN subprojects s ON p.subproject_id = s.subproject_id 
             WHERE s.project_id = $1 
             AND o.geometry IS NOT NULL
             ${level ? `AND p.parent_id IS ${level === 1 ? 'NULL' : 'NOT NULL'}` : ''}`,
            [projectId],
          )
          hasGeometries = countRes?.rows?.[0]?.count > 0
        } else if (tableName === 'occurrences_to_assess') {
          const countRes = await db.query(
            `SELECT COUNT(*) FROM occurrences o 
             INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id 
             INNER JOIN subprojects s ON oi.subproject_id = s.subproject_id 
             WHERE s.project_id = $1 
             AND o.place_id IS NULL
             AND (o.not_to_assign IS NULL OR o.not_to_assign = FALSE)
             AND o.geometry IS NOT NULL`,
            [projectId],
          )
          hasGeometries = countRes?.rows?.[0]?.count > 0
        } else if (tableName === 'occurrences_not_to_assign') {
          const countRes = await db.query(
            `SELECT COUNT(*) FROM occurrences o 
             INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id 
             INNER JOIN subprojects s ON oi.subproject_id = s.subproject_id 
             WHERE s.project_id = $1 
             AND o.place_id IS NULL
             AND o.not_to_assign = true
             AND o.geometry IS NOT NULL`,
            [projectId],
          )
          hasGeometries = countRes?.rows?.[0]?.count > 0
        }

        if (hasGeometries) {
          filtered.push(layer)
        }
      }
      setOwnVectorLayers(filtered)
    }

    filterLayers()
  }, [res, projectId, db])

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
