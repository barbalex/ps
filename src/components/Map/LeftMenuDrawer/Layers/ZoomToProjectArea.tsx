import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { TbZoomScan } from 'react-icons/tb'
import { TooltipButton } from '../../../shared/TooltipButton.tsx'
import { extentToBoundsWithMargin } from '../../../../modules/geoQueries.ts'
import { useProjectAreaLayer } from '../../../../modules/projectAreaLayer.tsx'
import { mapBoundsAtom } from '../../../../store.ts'

export function ZoomToProjectArea({ projectId, className }: {
  projectId: string
  className: string
}) {
  const { extent } = useProjectAreaLayer(projectId)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const { formatMessage } = useIntl()
  return (
    <TooltipButton
      icon={<TbZoomScan />}
      label={formatMessage({ id: 'mapZoomToLayer', defaultMessage: 'Auf Layer zoomen' })}
      disabled={!extent}
      onClick={(event) => {
        event.stopPropagation()
        if (extent) setMapBounds(extentToBoundsWithMargin(extent))
      }}
      className={className}
      appearance="subtle"
      size="small"
      as="a"
    />
  )
}
