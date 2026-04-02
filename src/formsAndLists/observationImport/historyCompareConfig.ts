export const excludedDisplayFields = new Set([
  'sys_period',
  'created_at',
  'created_time',
  'gbif_filters',
  'gbif_download_key',
])

export const excludedRestoreFields = new Set([
  'observation_import_id',
  'account_id',
  'subproject_id',
  'created_time',
  'inserted_count',
  'gbif_filters',
  'gbif_download_key',
  'label_creation',
  'label',
  'sys_period',
  'created_at',
  'updated_at',
  'updated_by',
])

export const preferredOrder = [
  'name',
  'attribution',
  'id_field',
  'geometry_method',
  'geojson_geometry_field',
  'x_coordinate_field',
  'y_coordinate_field',
  'crs',
  'label_creation',
  'previous_import',
]
