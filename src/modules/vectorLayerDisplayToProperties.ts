import { Vector_layer_displays as VectorLayerDisplay } from '../generated/client'

interface Props {
  vectorLayerDisplay: VectorLayerDisplay
  extraProps?: Record<string, unknown>
}

export const vectorLayerDisplayToProperties = ({
  vectorLayerDisplay: vld,
  extraProps,
}: Props): Record<string, unknown> => {
  if (!vld) return {}

  // TODO: add missing styles for points?
  return {
    ...(typeof vld.stroke === 'number' && { stroke: vld.stroke === 1 }),
    ...(vld.color && { color: vld.color }),
    ...(typeof vld.weight === 'number' && { weight: vld.weight }),
    ...(typeof vld.opacity_percent === 'number' && {
      opacity: vld.opacity_percent / 100,
    }),
    ...(vld.line_cap && { lineCap: vld.line_cap }),
    ...(vld.line_join && { lineJoin: vld.line_join }),
    ...(vld.dash_array && { dashArray: vld.dash_array }),
    ...(vld.dash_offset && { dashOffset: vld.dash_offset }),
    ...(typeof vld.fill === 'number' && { fill: vld.fill === 1 }),
    ...(vld.fill_color && { fillColor: vld.fill_color }),
    ...(typeof vld.fill_opacity_percent === 'number' && {
      fillOpacity: vld.fill_opacity_percent / 100,
    }),
    ...(vld.fill_rule && { fillRule: vld.fill_rule }),
    ...extraProps,
  }
}
