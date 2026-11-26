import { useIntl } from 'react-intl'
import { useParams } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { BsCheckSquareFill, BsSquare } from 'react-icons/bs'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { useContext } from 'react'
import { OSM_LAYER_PRESENTATION_ID, useUrlLayers } from '../../../../../modules/useUrlLayers.ts'
import { mapLayerSortingAtom } from '../../../../../store.ts'
import {
  POSITRON_LAYER_PRESENTATION_ID,
  DARK_MATTER_LAYER_PRESENTATION_ID,
  ThemeBackground,
} from '../../../../../modules/themeBackground.ts'
import {
  ESRI_IMAGERY_LAYER_PRESENTATION_ID,
  availableBackgroundId,
  backgroundLayerIds,
  isBackgroundLayerId,
} from '../../../layers/backgroundLayers.ts'
import layerStyles from '../index.module.css'
import styles from './index.module.css'

// labels for the drawer's pseudo background layers, keyed by id
const labels: Record<string, { id: string; defaultMessage: string }> = {
  [OSM_LAYER_PRESENTATION_ID]: {
    id: 'mapBackgroundLayerOsm',
    defaultMessage: 'OpenStreetMap',
  },
  [POSITRON_LAYER_PRESENTATION_ID]: {
    id: 'mapBackgroundLayerPositron',
    defaultMessage: 'Positron (hell)',
  },
  [DARK_MATTER_LAYER_PRESENTATION_ID]: {
    id: 'mapBackgroundLayerDarkMatter',
    defaultMessage: 'Dark Matter (dunkel)',
  },
  [ESRI_IMAGERY_LAYER_PRESENTATION_ID]: {
    id: 'mapBackgroundLayerEsriImagery',
    defaultMessage: 'Satellit / Luftbild (Esri)',
  },
}

export const BackgroundLayers = () => {
  const defaultBackgroundLayerId = useContext(ThemeBackground)
  const { formatMessage } = useIntl()
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })
  const { layers: effectiveLayers, isOverridden, setLayers } = useUrlLayers()
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)

  // background tile layers of the project (tile_layers with is_background):
  // their presentation is created with the layer, so they can be listed here
  const resTileBackgrounds = useLiveQuery(
    `
    SELECT tl.label, lp.layer_presentation_id
    FROM tile_layers tl
      JOIN layer_presentations lp ON tl.tile_layer_id = lp.tile_layer_id
    WHERE tl.project_id = $1
      AND tl.is_background = TRUE
    ORDER BY coalesce(tl.label, tl.tile_layer_id::text)`,
    [projectId],
  )
  const tileBackgrounds = (resTileBackgrounds?.rows ?? []) as unknown as {
    label: string | null
    layer_presentation_id: string
  }[]
  const tileBackgroundIds = tileBackgrounds.map(
    (tb) => tb.layer_presentation_id,
  )

  // the chosen background is whichever background id (pseudo or tile layer)
  // the effective render list contains; if none (e.g. a hand-crafted
  // ?layers= link), the default counts as chosen
  const currentId = availableBackgroundId(
    effectiveLayers.find(
      (id) => isBackgroundLayerId(id) || tileBackgroundIds.includes(id),
    ) ?? defaultBackgroundLayerId,
  )

  const pick = (id: string) => {
    if (id === currentId) return
    // replace the current background id with the picked one; if the list
    // has none, append the picked one at the end (lowest pane = base)
    const isBackgroundId = (ls: string) =>
      isBackgroundLayerId(ls) || tileBackgroundIds.includes(ls)
    const swap = (list: string[]) =>
      list.some(isBackgroundId) ?
        list.map((ls) => (isBackgroundId(ls) ? id : ls))
      : [...list, id]
    // an active ?layers= override is the render list: write the param like
    // the other layer toggles do, the sorting atom otherwise
    if (isOverridden) {
      setLayers(swap(effectiveLayers))
    } else {
      setMapLayerSorting(swap(mapLayerSorting))
    }
  }

  return (
    <ErrorBoundary>
      <section>
        <h2 className={layerStyles.title}>
          {formatMessage({
            id: 'mapBackgroundLayersTitle',
            defaultMessage: 'Hintergrundkarte',
          })}
        </h2>
        <div className={styles.list}>
          {backgroundLayerIds.map((id) => (
            <Button
              key={id}
              appearance="transparent"
              className={styles.row}
              icon={
                id === currentId ? (
                  <BsCheckSquareFill className={layerStyles.checkedToggleIcon} />
                ) : (
                  <BsSquare className={layerStyles.headerToggleIcon} />
                )
              }
              onClick={() => pick(id)}
            >
              <span className={layerStyles.headerLabel}>
                {formatMessage(labels[id])}
              </span>
            </Button>
          ))}
          {tileBackgrounds.map((tb) => (
            <Button
              key={tb.layer_presentation_id}
              appearance="transparent"
              className={styles.row}
              icon={
                tb.layer_presentation_id === currentId ? (
                  <BsCheckSquareFill className={layerStyles.checkedToggleIcon} />
                ) : (
                  <BsSquare className={layerStyles.headerToggleIcon} />
                )
              }
              onClick={() => pick(tb.layer_presentation_id)}
            >
              <span className={layerStyles.headerLabel}>
                {tb.label ||
                  formatMessage({
                    id: 'tileLayerNoName',
                    defaultMessage: 'Tile-Layer ohne Name',
                  })}
              </span>
            </Button>
          ))}
        </div>
      </section>
    </ErrorBoundary>
  )
}
