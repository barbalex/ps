/**
 * Represents the table public.wfs_service_layers_history
 * System-versioned history of wfs_service_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface WfsServiceLayersHistory {
  wfs_service_layer_id: string;

  account_id: string | null;

  wfs_service_id: string | null;

  name: string | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.wfs_service_layers_history
 * System-versioned history of wfs_service_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface WfsServiceLayersHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  wfs_service_layer_id?: string;

  account_id?: string | null;

  wfs_service_id?: string | null;

  name?: string | null;

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
 * Represents the mutator for the table public.wfs_service_layers_history
 * System-versioned history of wfs_service_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface WfsServiceLayersHistoryMutator {
  wfs_service_layer_id?: string;

  account_id?: string | null;

  wfs_service_id?: string | null;

  name?: string | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}