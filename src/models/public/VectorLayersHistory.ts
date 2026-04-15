import type { default as VectorLayerTypesEnum } from './VectorLayerTypesEnum.js';
import type { default as VectorLayerOwnTablesEnum } from './VectorLayerOwnTablesEnum.js';

/**
 * Represents the table public.vector_layers_history
 * System-versioned history of vector_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface VectorLayersHistory {
  vector_layer_id: string;

  label: string | null;

  project_id: string;

  type: VectorLayerTypesEnum | null;

  own_table: VectorLayerOwnTablesEnum | null;

  own_table_level: number | null;

  properties: unknown | null;

  display_by_property: string | null;

  max_features: number | null;

  wfs_service_id: string | null;

  wfs_service_layer_name: string | null;

  feature_count: number | null;

  point_count: number | null;

  line_count: number | null;

  polygon_count: number | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.vector_layers_history
 * System-versioned history of vector_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface VectorLayersHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  vector_layer_id?: string;

  label?: string | null;

  project_id: string;

  type?: VectorLayerTypesEnum | null;

  own_table?: VectorLayerOwnTablesEnum | null;

  /** Default value: 1 */
  own_table_level?: number | null;

  properties?: unknown | null;

  display_by_property?: string | null;

  /** Default value: 1000 */
  max_features?: number | null;

  wfs_service_id?: string | null;

  wfs_service_layer_name?: string | null;

  feature_count?: number | null;

  point_count?: number | null;

  line_count?: number | null;

  polygon_count?: number | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.vector_layers_history
 * System-versioned history of vector_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface VectorLayersHistoryMutator {
  vector_layer_id?: string;

  label?: string | null;

  project_id?: string;

  type?: VectorLayerTypesEnum | null;

  own_table?: VectorLayerOwnTablesEnum | null;

  own_table_level?: number | null;

  properties?: unknown | null;

  display_by_property?: string | null;

  max_features?: number | null;

  wfs_service_id?: string | null;

  wfs_service_layer_name?: string | null;

  feature_count?: number | null;

  point_count?: number | null;

  line_count?: number | null;

  polygon_count?: number | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}