import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { BsCheckSquareFill, BsSquare } from 'react-icons/bs'
import { useAtom } from 'jotai'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { useUrlLayers } from '../../../../../modules/useUrlLayers.ts'
import { mapLayerSortingAtom } from '../../../../../store.ts'
import {
  POSITRON_LAYER_PRESENTATION_ID,
  DARK_MATTER_LAYER_PRESENTATION_ID,
  backgroundLayerIds,
  defaultBackgroundLayerId,
  isBackgroundLayerId,
} from '../../../layers/backgroundLayers.ts'
import layerStyles from '../index.module.css'
import styles from './index.module.css'

export const BackgroundLayers = () => {
  const { formatMessage } = useIntl()
  const { layers: effectiveLayers, isOverridden, setLayers } = useUrlLayers()
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)

  // the chosen background is whichever background id the effective render
  // list contains; if none (e.g. a hand-crafted ?layers= link), the default
  // counts as chosen
  const currentId =
    effectiveLayers.find(isBackgroundLayerId) ?? defaultBackgroundLayerId

  // the labels must be inline for formatjs extract to find them
  const labelFor = (id: string) => {
    switch (id) {
      case POSITRON_LAYER_PRESENTATION_ID:
        return formatMessage({
          id: 'mapBackgroundLayerPositron',
          defaultMessage: 'Positron (hell)',
        })
      case DARK_MATTER_LAYER_PRESENTATION_ID:
        return formatMessage({
          id: 'mapBackgroundLayerDarkMatter',
          defaultMessage: 'Dark Matter (dunkel)',
        })
      default:
        return formatMessage({
          id: 'mapBackgroundLayerOsm',
          defaultMessage: 'OpenStreetMap',
        })
    }
  }

  const pick = (id: string) => {
    if (id === currentId) return
    // replace the current background id with the picked one; if the list
    // has none, append the picked one at the end (lowest pane = base)
    const swap = (list: string[]) =>
      list.some(isBackgroundLayerId) ?
        list.map((ls) => (isBackgroundLayerId(ls) ? id : ls))
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
                  <BsCheckSquareFill className={layerStyles.headerToggleIcon} />
                ) : (
                  <BsSquare className={layerStyles.headerToggleIcon} />
                )
              }
              onClick={() => pick(id)}
            >
              <span className={layerStyles.headerLabel}>
                {labelFor(id)}
              </span>
            </Button>
          ))}
        </div>
      </section>
    </ErrorBoundary>
  )
}
