export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'properties',
  'label_de',
  'label_en',
  'label_fr',
  'label_it',
])

export const excludedRestoreFields = new Set([
  'vector_layer_id',
  'project_id',
  'name',
  'label_de',
  'label_en',
  'label_fr',
  'label_it',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = [
  'type',
  'wfs_service_id',
  'wfs_service_layer_name',
  'name',
  'label_de',
  'label_en',
  'label_fr',
  'label_it',
  'max_features',
  'display_by_property',
  'own_table',
  'own_table_level',
  'feature_count',
  'point_count',
  'line_count',
  'polygon_count',
]
