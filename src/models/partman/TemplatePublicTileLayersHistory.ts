/** Represents the table partman.template_public_tile_layers_history */
export default interface TemplatePublicTileLayersHistory {
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

/** Represents the initializer for the table partman.template_public_tile_layers_history */
export interface TemplatePublicTileLayersHistoryInitializer {
  tile_layer_id: string;

  project_id: string;

  label?: string | null;

  url_template?: string | null;

  subdomains?: unknown | null;

  max_native_zoom?: number | null;

  attribution?: string | null;

  is_background?: boolean | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_tile_layers_history */
export interface TemplatePublicTileLayersHistoryMutator {
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