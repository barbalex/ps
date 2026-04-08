/**
 * Represents the table public.wms_service_layers_history
 * System-versioned history of wms_service_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface WmsServiceLayersHistory {
  wms_service_layer_id: string;

  account_id: string | null;

  wms_service_id: string | null;

  name: string | null;

  label: string | null;

  queryable: boolean | null;

  legend_url: string | null;

  legend_image: unknown | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.wms_service_layers_history
 * System-versioned history of wms_service_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface WmsServiceLayersHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  wms_service_layer_id?: string;

  account_id?: string | null;

  wms_service_id?: string | null;

  name?: string | null;

  label?: string | null;

  queryable?: boolean | null;

  legend_url?: string | null;

  legend_image?: unknown | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.wms_service_layers_history
 * System-versioned history of wms_service_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface WmsServiceLayersHistoryMutator {
  wms_service_layer_id?: string;

  account_id?: string | null;

  wms_service_id?: string | null;

  name?: string | null;

  label?: string | null;

  queryable?: boolean | null;

  legend_url?: string | null;

  legend_image?: unknown | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}