import type { default as public_VectorLayerTypesEnum } from '../public/VectorLayerTypesEnum.js';
import type { default as public_VectorLayerOwnTablesEnum } from '../public/VectorLayerOwnTablesEnum.js';

/** Represents the table partman.template_public_vector_layers_history */
export default interface TemplatePublicVectorLayersHistory {
  vector_layer_id: string;

  label: string | null;

  project_id: string;

  type: public_VectorLayerTypesEnum | null;

  own_table: public_VectorLayerOwnTablesEnum | null;

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

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_vector_layers_history */
export interface TemplatePublicVectorLayersHistoryInitializer {
  vector_layer_id: string;

  label?: string | null;

  project_id: string;

  type?: public_VectorLayerTypesEnum | null;

  own_table?: public_VectorLayerOwnTablesEnum | null;

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

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_vector_layers_history */
export interface TemplatePublicVectorLayersHistoryMutator {
  vector_layer_id?: string;

  label?: string | null;

  project_id?: string;

  type?: public_VectorLayerTypesEnum | null;

  own_table?: public_VectorLayerOwnTablesEnum | null;

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

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}