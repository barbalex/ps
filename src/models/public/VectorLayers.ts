import type { AccountsAccountId } from './Accounts.js';
import type { ProjectsProjectId } from './Projects.js';
import type { default as VectorLayerTypesEnum } from './VectorLayerTypesEnum.js';
import type { default as VectorLayerOwnTablesEnum } from './VectorLayerOwnTablesEnum.js';
import type { WfsServicesWfsServiceId } from './WfsServices.js';

/** Identifier type for public.vector_layers */
export type VectorLayersVectorLayerId = string & { __brand: 'public.vector_layers' };

/**
 * Represents the table public.vector_layers
 * Goal: Bring your own wms layers. Either from wfs or importing GeoJSON. Should only contain metadata, not data fetched from wms or wmts servers (that should only be saved locally on the client).
 */
export default interface VectorLayers {
  vector_layer_id: VectorLayersVectorLayerId;

  account_id: AccountsAccountId | null;

  label: string | null;

  project_id: ProjectsProjectId;

  type: VectorLayerTypesEnum | null;

  own_table: VectorLayerOwnTablesEnum | null;

  own_table_level: number | null;

  /** array of data field names. Originating from wfs or own table. Used to display by property field values. Set after importing wfs data or altering own tables properties */
  properties: unknown | null;

  /** Name of the field whose values is used to display the layer. If null, a single display is used. */
  display_by_property: string | null;

  max_features: number | null;

  wfs_service_id: WfsServicesWfsServiceId | null;

  wfs_service_layer_name: string | null;

  /** Number of features. Set when downloaded features */
  feature_count: number | null;

  /** Number of point features. Used to show styling for points - or not. Set when downloaded features */
  point_count: number | null;

  /** Number of line features. Used to show styling for lines - or not. Set when downloaded features */
  line_count: number | null;

  /** Number of polygon features. Used to show styling for polygons - or not. Set when downloaded features */
  polygon_count: number | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.vector_layers
 * Goal: Bring your own wms layers. Either from wfs or importing GeoJSON. Should only contain metadata, not data fetched from wms or wmts servers (that should only be saved locally on the client).
 */
export interface VectorLayersInitializer {
  /** Default value: uuid_generate_v7() */
  vector_layer_id?: VectorLayersVectorLayerId;

  account_id?: AccountsAccountId | null;

  label?: string | null;

  project_id: ProjectsProjectId;

  type?: VectorLayerTypesEnum | null;

  own_table?: VectorLayerOwnTablesEnum | null;

  /** Default value: 1 */
  own_table_level?: number | null;

  /** array of data field names. Originating from wfs or own table. Used to display by property field values. Set after importing wfs data or altering own tables properties */
  properties?: unknown | null;

  /** Name of the field whose values is used to display the layer. If null, a single display is used. */
  display_by_property?: string | null;

  /** Default value: 1000 */
  max_features?: number | null;

  wfs_service_id?: WfsServicesWfsServiceId | null;

  wfs_service_layer_name?: string | null;

  /** Number of features. Set when downloaded features */
  feature_count?: number | null;

  /** Number of point features. Used to show styling for points - or not. Set when downloaded features */
  point_count?: number | null;

  /** Number of line features. Used to show styling for lines - or not. Set when downloaded features */
  line_count?: number | null;

  /** Number of polygon features. Used to show styling for polygons - or not. Set when downloaded features */
  polygon_count?: number | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.vector_layers
 * Goal: Bring your own wms layers. Either from wfs or importing GeoJSON. Should only contain metadata, not data fetched from wms or wmts servers (that should only be saved locally on the client).
 */
export interface VectorLayersMutator {
  vector_layer_id?: VectorLayersVectorLayerId;

  account_id?: AccountsAccountId | null;

  label?: string | null;

  project_id?: ProjectsProjectId;

  type?: VectorLayerTypesEnum | null;

  own_table?: VectorLayerOwnTablesEnum | null;

  own_table_level?: number | null;

  /** array of data field names. Originating from wfs or own table. Used to display by property field values. Set after importing wfs data or altering own tables properties */
  properties?: unknown | null;

  /** Name of the field whose values is used to display the layer. If null, a single display is used. */
  display_by_property?: string | null;

  max_features?: number | null;

  wfs_service_id?: WfsServicesWfsServiceId | null;

  wfs_service_layer_name?: string | null;

  /** Number of features. Set when downloaded features */
  feature_count?: number | null;

  /** Number of point features. Used to show styling for points - or not. Set when downloaded features */
  point_count?: number | null;

  /** Number of line features. Used to show styling for lines - or not. Set when downloaded features */
  line_count?: number | null;

  /** Number of polygon features. Used to show styling for polygons - or not. Set when downloaded features */
  polygon_count?: number | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}