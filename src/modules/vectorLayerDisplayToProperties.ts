type DisplayLike = {
  stroke?: number | boolean | null
  color?: string | null
  weight?: number | null
  line_cap?: string | null
  line_join?: string | null
  dash_array?: string | null
  dash_offset?: string | null
  fill?: number | boolean | null
  fill_color?: string | null
  fill_opacity_percent?: number | null
  fill_rule?: string | null
}

type PresentationLike = {
  opacity_percent?: number | null
}

export const vectorLayerDisplayToProperties = ({
  vectorLayerDisplay: display,
  presentation,
  extraProps,
}: {
  vectorLayerDisplay?: DisplayLike | null
  presentation?: PresentationLike | null
  extraProps?: Record<string, unknown>
}): Record<string, unknown> => {
  if (!display) return {}

  // opacity needs to be converted from percent to decimal
  const lPOpacity =
    (presentation?.opacity_percent ?? 100) / 100
  const displayFillOpacity =
    (display.fill_opacity_percent ?? 100) / 100

  const style = {
    ...(display.stroke != null && { stroke: Boolean(display.stroke) }),
    ...(display.color && { color: display.color }),
    ...(typeof display.weight === 'number' && { weight: display.weight }),
    opacity: lPOpacity,
    ...(display.line_cap && { lineCap: display.line_cap }),
    ...(display.line_join && { lineJoin: display.line_join }),
    ...(display.dash_array && { dashArray: display.dash_array }),
    ...(display.dash_offset && { dashOffset: display.dash_offset }),
    ...(display.fill != null && { fill: Boolean(display.fill) }),
    ...(display.fill_color && { fillColor: display.fill_color }),
    // opacity can be set both in presentation and display...
    fillOpacity: displayFillOpacity * lPOpacity,
    ...(display.fill_rule && { fillRule: display.fill_rule }),
    ...extraProps,
  }

  // TODO: add missing styles for points?
  return style
}
