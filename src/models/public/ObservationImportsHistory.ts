import type { default as ObservationImportsGeometryMethodsEnum } from './ObservationImportsGeometryMethodsEnum.js';

/**
 * Represents the table public.observation_imports_history
 * System-versioned history of observation_imports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ObservationImportsHistory {
  observation_import_id: string;

  account_id: string | null;

  subproject_id: string | null;

  created_time: Date | null;

  inserted_count: number | null;

  id_field: string | null;

  geometry_method: ObservationImportsGeometryMethodsEnum | null;

  geojson_geometry_field: string | null;

  x_coordinate_field: string | null;

  y_coordinate_field: string | null;

  crs: string | null;

  label_creation: unknown | null;

  name: string | null;

  attribution: string | null;

  previous_import: string | null;

  download_from_gbif: boolean | null;

  gbif_filters: unknown | null;

  gbif_download_key: string | null;

  gbif_error: string | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.observation_imports_history
 * System-versioned history of observation_imports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ObservationImportsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  observation_import_id?: string;

  account_id?: string | null;

  subproject_id?: string | null;

  /** Default value: now() */
  created_time?: Date | null;

  inserted_count?: number | null;

  id_field?: string | null;

  geometry_method?: ObservationImportsGeometryMethodsEnum | null;

  geojson_geometry_field?: string | null;

  x_coordinate_field?: string | null;

  y_coordinate_field?: string | null;

  /** Default value: 4326 */
  crs?: string | null;

  label_creation?: unknown | null;

  name?: string | null;

  attribution?: string | null;

  previous_import?: string | null;

  download_from_gbif?: boolean | null;

  gbif_filters?: unknown | null;

  gbif_download_key?: string | null;

  gbif_error?: string | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.observation_imports_history
 * System-versioned history of observation_imports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ObservationImportsHistoryMutator {
  observation_import_id?: string;

  account_id?: string | null;

  subproject_id?: string | null;

  created_time?: Date | null;

  inserted_count?: number | null;

  id_field?: string | null;

  geometry_method?: ObservationImportsGeometryMethodsEnum | null;

  geojson_geometry_field?: string | null;

  x_coordinate_field?: string | null;

  y_coordinate_field?: string | null;

  crs?: string | null;

  label_creation?: unknown | null;

  name?: string | null;

  attribution?: string | null;

  previous_import?: string | null;

  download_from_gbif?: boolean | null;

  gbif_filters?: unknown | null;

  gbif_download_key?: string | null;

  gbif_error?: string | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}