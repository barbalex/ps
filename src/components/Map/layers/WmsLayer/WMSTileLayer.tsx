// react-leaflet 5's WMSTileLayer constructs Leaflet 1's TileLayer.WMS, which
// Leaflet 2 removed (renamed to the named-export WMSTileLayer class) — using
// it crashes the map with 'TileLayer$1.WMS is not a constructor'. This is the
// same component rebuilt for Leaflet 2 via @react-leaflet/core. Drop it once
// react-leaflet ships Leaflet 2 support.
import {
  createElementObject,
  createTileLayerComponent,
  updateGridLayer,
  withPane,
  type LayerProps,
  type LeafletContextInterface,
  type LeafletElement,
} from '@react-leaflet/core'
import { WMSTileLayer as LeafletWMSTileLayer } from 'leaflet'
import type { WMSParams } from 'leaflet'

export interface WMSTileLayerProps extends LayerProps {
  url: string
  /** extra WMS request params */
  params?: Partial<WMSParams>
  // WMS request params as top-level props, the way Leaflet 1's TileLayer.WMS
  // accepted them: options the class does not know become request parameters
  layers?: string
  styles?: string
  format?: string
  transparent?: boolean
  version?: string
  uppercase?: boolean
  // tile layer options this app's WMS layers use
  minZoom?: number
  maxZoom?: number
  className?: string
  opacity?: number
}

const createWMSTileLayer = (
  { eventHandlers: _eventHandlers, params = {}, url, ...options }: WMSTileLayerProps,
  context: LeafletContextInterface,
): LeafletElement<LeafletWMSTileLayer> => {
  const layer = new LeafletWMSTileLayer(url, {
    ...params,
    ...options,
    ...withPane(options, context),
  })
  return createElementObject(layer, context)
}

const updateWMSTileLayer = (
  layer: LeafletWMSTileLayer,
  props: WMSTileLayerProps,
  prevProps: WMSTileLayerProps,
) => {
  updateGridLayer(layer, props, prevProps)
  if (props.params != null && props.params !== prevProps.params) {
    layer.setParams(props.params)
  }
}

export const WMSTileLayer = createTileLayerComponent<
  LeafletWMSTileLayer,
  WMSTileLayerProps
>(createWMSTileLayer, updateWMSTileLayer)
