import { useIntl } from 'react-intl'
import { useParams } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Accordion, Button } = fluentUiReactComponents
import type {
  AccordionToggleData,
  AccordionToggleEvent,
} from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'
import { useAtom, atom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { TileLayerRow } from './TileLayer.tsx'
import { createTileLayer } from '../../../../../modules/createRows.ts'
import layerStyles from '../index.module.css'
import type TileLayersModel from '../../../../../models/public/TileLayers.ts'

export type TileLayerRowModel = TileLayersModel & {
  layer_presentation_id: string | null
  active: boolean | null
}

// unlike the wms section, this lists every tile layer of the project: their
// config (url template etc.) lives here, while activation shows them under
// Active and background ones are chosen in the Hintergrundkarte section
const openItemsAtom = atom<string[]>([])

export const TileLayers = () => {
  const { formatMessage } = useIntl()
  const [openItems, setOpenItems] = useAtom(openItemsAtom)
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const resTileLayers = useLiveQuery<TileLayerRowModel>(
    `
    SELECT tl.*, lp.layer_presentation_id, lp.active
    FROM tile_layers tl
      LEFT JOIN layer_presentations lp ON lp.tile_layer_id = tl.tile_layer_id
    WHERE tl.project_id = $1
    ORDER BY coalesce(tl.label, tl.tile_layer_id::text)`,
    [projectId],
  )
  const tileLayers: TileLayerRowModel[] = resTileLayers?.rows ?? []

  const addRow = async () => {
    const tileLayerId = await createTileLayer({ projectId })
    setOpenItems((prev) => [...prev, tileLayerId])
  }

  const onToggleItem = (
    _event: AccordionToggleEvent,
    { value: tileLayerId, openItems }: AccordionToggleData<string>,
  ) => {
    setOpenItems(
      openItems.includes(tileLayerId) ?
        openItems.filter((id) => id !== tileLayerId)
      : [...openItems, tileLayerId],
    )
  }

  if (projectId === '99999999-9999-9999-9999-999999999999') {
    return (
      <section>
        <h2 className={layerStyles.title}>{formatMessage({ id: 'mapTileLayers', defaultMessage: 'Kachelebenen' })}</h2>
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
        <h2 className={layerStyles.title}>{formatMessage({ id: 'mapTileLayers', defaultMessage: 'Kachelebenen' })}</h2>
        <Accordion multiple collapsible openItems={openItems} onToggle={onToggleItem}>
          {tileLayers.length ?
            tileLayers.map((l, index) => (
              <TileLayerRow
                key={l.tile_layer_id}
                layer={l}
                isLast={index === tileLayers.length - 1}
                isOpen={openItems.includes(l.tile_layer_id)}
              />
            ))
          : <p className={layerStyles.none}>{formatMessage({ id: 'mapNoTileLayers', defaultMessage: 'Noch keine Kachelebenen' })}</p>}
          <Button
            size="small"
            icon={<FaPlus />}
            onClick={addRow}
            title={formatMessage({ id: 'mapAddTile', defaultMessage: 'Kachelebene hinzufügen' })}
            className={layerStyles.addButton}
          />
        </Accordion>
      </section>
    </ErrorBoundary>
  )
}
