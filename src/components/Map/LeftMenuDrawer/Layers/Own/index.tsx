import { useIntl } from 'react-intl'
import { useParams } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Accordion } = fluentUiReactComponents
import type {
  AccordionToggleData,
  AccordionToggleEvent,
} from '@fluentui/react-components'
import { useAtom, atom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { OwnLayer, type OwnLayerRow } from './OwnLayer.tsx'
import { projectAreaTable, useProjectAreaLayer } from '../../../../../modules/projectAreaLayer.tsx'
import { useUrlLayers } from '../../../../../modules/useUrlLayers.ts'
import { getVectorLayerLabel } from '../../../../../modules/vectorLayerLabel.ts'
import { useProjectLabel } from '../../../../../modules/navRollupsContext.ts'
import { languageAtom } from '../../../../../store.ts'
import layerStyles from '../index.module.css'
import type VectorLayers from '../../../../../models/public/VectorLayers.ts'
import type PlaceLevels from '../../../../../models/public/PlaceLevels.ts'

// what accordion items are open
// needs to be controlled to prevent opening when layer is deactivated
const openItemsAtom = atom<string[]>([])

export const OwnLayers = () => {
  const { formatMessage } = useIntl()
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const [language] = useAtom(languageAtom)
  const { projectId = '99999999-9999-9999-9999-999999999999' } =
    useParams({ strict: false })

  const { available } = useProjectAreaLayer(projectId)
  const projectLabel = useProjectLabel(projectId)
  const { isLayerVisible } = useUrlLayers()
  // Show table-based vector layers that are not currently active
  const res = useLiveQuery(
    `
    SELECT *,
      (
        SELECT json_agg(
          json_build_object(
            'layer_presentation_id', lp.layer_presentation_id,
            'active', lp.active
          ) ORDER BY lp.active DESC, lp.layer_presentation_id
        )
        FROM layer_presentations lp
        WHERE lp.vector_layer_id = vector_layers.vector_layer_id
      ) as layer_presentations
    FROM vector_layers
    WHERE
      own_table IS NOT NULL
      AND project_id = $1
      AND (own_table = '${projectAreaTable}' OR NOT EXISTS (
        SELECT 1
        FROM layer_presentations
        WHERE
          layer_presentations.vector_layer_id = vector_layers.vector_layer_id
          AND layer_presentations.active
      ))
    ORDER BY
      CASE
        WHEN own_table = '${projectAreaTable}' THEN -1
        WHEN own_table = 'observations_to_assess' THEN 0
        WHEN own_table = 'observations_not_to_assign' THEN 1
        WHEN own_table = 'places' AND own_table_level = 1 THEN 2
        WHEN own_table = 'checks' AND own_table_level = 1 THEN 3
        WHEN own_table = 'actions' AND own_table_level = 1 THEN 4
        WHEN own_table = 'observations_assigned' AND own_table_level = 1 THEN 5
        WHEN own_table = 'observations_assigned_lines' AND own_table_level = 1 THEN 6
        WHEN own_table = 'places' AND own_table_level = 2 THEN 7
        WHEN own_table = 'checks' AND own_table_level = 2 THEN 8
        WHEN own_table = 'actions' AND own_table_level = 2 THEN 9
        WHEN own_table = 'observations_assigned' AND own_table_level = 2 THEN 10
        WHEN own_table = 'observations_assigned_lines' AND own_table_level = 2 THEN 11
        ELSE 12
      END,
      name
  `,
    [projectId],
  )
  const placeLevelsRes = useLiveQuery<PlaceLevels>(
    `SELECT * FROM place_levels WHERE project_id = $1`,
    [projectId],
  )
  const placeLevels = placeLevelsRes?.rows ?? []
  // Attach the derived display label so children can render layer.label
  // and the existing (inactive) presentation so activating reuses it
  const ownVectorLayers = ((res?.rows ?? []) as unknown as OwnLayerRow[]).filter((layer) => {
    if (layer.own_table !== projectAreaTable) return true
    const presentation = layer.layer_presentations?.[0]
    return layer.project_id === projectId && available && !!presentation && !isLayerVisible(presentation.layer_presentation_id, presentation.active)
  }).map(
    (l) => ({
      ...l,
      layer_presentation_id: l.layer_presentations?.[0]?.layer_presentation_id,
      label: getVectorLayerLabel(l as VectorLayers, language, placeLevels, projectLabel),
    }),
  )

  const onToggleItem = (
    _event: AccordionToggleEvent,
    { openItems }: AccordionToggleData<string>,
  ) => setOpenItems(openItems)

  if (projectId === '99999999-9999-9999-9999-999999999999') {
    return (
      <section>
        <h2 className={layerStyles.title}>{formatMessage({ id: 'mapOwnLayers', defaultMessage: 'Eigene Ebenen' })}</h2>
        <div className={layerStyles.layerList}>
          <p className={layerStyles.none}>
            {formatMessage({ id: 'mapChooseProjectForLayers', defaultMessage: 'Projekt wählen, um diese Ebenen zu sehen.' })}
          </p>
        </div>
      </section>
    )
  }

  return (
    <ErrorBoundary>
      <section>
        <h2 className={layerStyles.title}>{formatMessage({ id: 'mapOwnLayers', defaultMessage: 'Eigene Ebenen' })}</h2>
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
            <p className={layerStyles.none}>{formatMessage({ id: 'mapNoInactiveOwn', defaultMessage: 'Keine inaktiven eigenen Ebenen' })}</p>
          )}
        </Accordion>
      </section>
    </ErrorBoundary>
  )
}
