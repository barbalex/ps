import type { WmsServicesWmsServiceId } from './WmsServices.js';

/** Identifier type for public.wms_service_layers */
export type WmsServiceLayersWmsServiceLayerId = string & { __brand: 'public.wms_service_layers' };

/** Represents the table public.wms_service_layers */
export default interface WmsServiceLayers {
  wms_service_layer_id: WmsServiceLayersWmsServiceLayerId;

  wms_service_id: WmsServicesWmsServiceId | null;

  name: string | null;

  label: string | null;

  queryable: boolean | null;

  legend_url: string | null;

  legend_image: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table public.wms_service_layers */
export interface WmsServiceLayersInitializer {
  /** Default value: uuid_generate_v7() */
  wms_service_layer_id?: WmsServiceLayersWmsServiceLayerId;

  wms_service_id?: WmsServicesWmsServiceId | null;

  name?: string | null;

  label?: string | null;

  queryable?: boolean | null;

  legend_url?: string | null;

  legend_image?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table public.wms_service_layers */
export interface WmsServiceLayersMutator {
  wms_service_layer_id?: WmsServiceLayersWmsServiceLayerId;

  wms_service_id?: WmsServicesWmsServiceId | null;

  name?: string | null;

  label?: string | null;

  queryable?: boolean | null;

  legend_url?: string | null;

  legend_image?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}