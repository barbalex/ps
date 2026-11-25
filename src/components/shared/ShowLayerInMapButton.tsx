import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { createLayerPresentation } from '../../modules/createRows.ts'
import { useLayerActivation } from '../../modules/useLayerActivation.ts'
import { useUrlLayers } from '../../modules/useUrlLayers.ts'
import { useUrlPanes } from '../../modules/useUrlPanes.ts'
import type LayerPresentations from '../../models/public/LayerPresentations.ts'

type Props =
  | { vectorLayerId: string; wmsLayerId?: undefined }
  | { vectorLayerId?: undefined; wmsLayerId: string }

// The vector/wms layer forms' header button. Same activation semantics as
// the map drawer's layer toggle (see modules/useLayerActivation.ts): the
// design flag (layer_presentations.active — what lists the layer under
// Active) plus membership in the render list, plus the map tab being open.
export const ShowLayerInMapButton = ({ vectorLayerId, wmsLayerId }: Props) => {
  const [tabs, setTabs] = useUrlPanes()
  const { formatMessage } = useIntl()
  const { isLayerVisible } = useUrlLayers()
  const { activateLayer, deactivateLayer, joinRenderList } =
    useLayerActivation()

  // the layer's presentation, live so a newly created one is reflected
  const resPresentation = useLiveQuery(
    vectorLayerId
      ? `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`
      : `SELECT * FROM layer_presentations WHERE wms_layer_id = $1`,
    [vectorLayerId ?? wmsLayerId],
  )
  const presentation = resPresentation?.rows?.[0] as
    | LayerPresentations
    | undefined
  const presentationId = presentation?.layer_presentation_id
  const isVisible = isLayerVisible(presentationId ?? '', presentation?.active === true)

  const onClick = async () => {
    // deactivate a visible layer: view off and design flag off
    if (isVisible && presentationId) {
      await deactivateLayer(presentationId)
      return
    }
    // map needs to be visible
    if (!tabs.includes('map')) {
      setTabs([...tabs, 'map'])
    }
    // activate: create the missing layer_presentation (already active) or
    // set the design flag, then make the layer render
    if (!presentationId) {
      const newLayerPresentationId = await createLayerPresentation({
        vectorLayerId: vectorLayerId ?? null,
        wmsLayerId: wmsLayerId ?? null,
        active: true,
      })
      if (newLayerPresentationId) joinRenderList(newLayerPresentationId)
      return
    }
    await activateLayer(presentationId)
  }

  return (
    <Button
      size="medium"
      icon={isVisible ? <MdLayersClear /> : <MdLayers />}
      onClick={onClick}
      title={
        isVisible
          ? formatMessage({
              id: 'layerRemoveFromMapBtnTitle',
              defaultMessage: 'Ebene aus Karte entfernen',
            })
          : formatMessage({
              id: 'layerShowInMapBtnTitle',
              defaultMessage: 'Ebene in Karte anzeigen',
            })
      }
    />
  )
}
