export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'label',
  'account_id',
  'vector_layer_id',
])

export const excludedRestoreFields = new Set([
  'vector_layer_display_id',
  'account_id',
  'vector_layer_id',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = [
  'marker_type',
  'circle_marker_radius',
  'marker_symbol',
  'marker_size',
  'color',
  'weight',
  'line_cap',
  'line_join',
  'dash_array',
  'dash_offset',
  'stroke',
  'fill',
  'fill_color',
  'fill_opacity_percent',
  'fill_rule',
  'display_property_value',
]
