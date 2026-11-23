/**
 * Represents the table public.tile_layers_history
 * System-versioned history of tile_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface TileLayersHistory {
  tile_layer_id: string;

  project_id: string;

  label: string | null;

  url_template: string | null;

  subdomains: unknown | null;

  max_native_zoom: number | null;

  attribution: string | null;

  is_background: boolean | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.tile_layers_history
 * System-versioned history of tile_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface TileLayersHistoryInitializer {
  /** Default value: uuidv7() */
  tile_layer_id?: string;

  project_id: string;

  label?: string | null;

  url_template?: string | null;

  subdomains?: unknown | null;

  max_native_zoom?: number | null;

  attribution?: string | null;

  /** Default value: false */
  is_background?: boolean | null;

  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.tile_layers_history
 * System-versioned history of tile_layers. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface TileLayersHistoryMutator {
  tile_layer_id?: string;

  project_id?: string;

  label?: string | null;

  url_template?: string | null;

  subdomains?: unknown | null;

  max_native_zoom?: number | null;

  attribution?: string | null;

  is_background?: boolean | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}