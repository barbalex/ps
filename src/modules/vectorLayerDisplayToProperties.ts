export const vectorLayerDisplayToProperties = ({
  vectorLayerDisplay: display,
  presentation,
  extraProps,
}): Record<string, unknown> => {
  if (!display) return {}

  // opacity needs to be converted from percent to decimal
  const lPOpacity = presentation.opacity_percent
    ? presentation.opacity_percent / 100
    : 1
  const displayFillOpacity = display.fill_opacity_percent
    ? display.fill_opacity_percent / 100
    : 1

  const style = {
    ...(typeof display.stroke === 'number' && { stroke: display.stroke === 1 }),
    ...(display.color && { color: display.color }),
    ...(typeof display.weight === 'number' && { weight: display.weight }),
    opacity: lPOpacity,
    ...(display.line_cap && { lineCap: display.line_cap }),
    ...(display.line_join && { lineJoin: display.line_join }),
    ...(display.dash_array && { dashArray: display.dash_array }),
    ...(display.dash_offset && { dashOffset: display.dash_offset }),
    ...(typeof display.fill === 'number' && { fill: display.fill === 1 }),
    ...(display.fill_color && { fillColor: display.fill_color }),
    // opacity can be set both in presentation and display...
    fillOpacity: displayFillOpacity * lPOpacity,
    ...(display.fill_rule && { fillRule: display.fill_rule }),
    ...extraProps,
  }

  // TODO: add missing styles for points?
  return style
}
