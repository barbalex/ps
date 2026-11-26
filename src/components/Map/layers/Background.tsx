import { TileLayer } from 'react-leaflet'

import type { BackgroundLayer } from './backgroundLayers.ts'

type Props = {
  background: BackgroundLayer
}

export const Background = ({ background }: Props) => (
  <TileLayer
    url={background.url}
    attribution={background.attribution}
    {...(background.maxZoom ? { maxZoom: background.maxZoom } : {})}
    // only forward the optional fields when set: passing subdomains={undefined}
    // overwrites leaflet's 'abc' default and crashes tile urls ({s} has no value)
    {...(background.subdomains ? { subdomains: background.subdomains } : {})}
    {...(background.maxNativeZoom ?
      { maxNativeZoom: background.maxNativeZoom }
    : {})}
  />
)
