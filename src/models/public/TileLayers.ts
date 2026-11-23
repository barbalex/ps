import type { ProjectsProjectId } from './Projects.ts';

/** Identifier type for public.tile_layers */
export type TileLayersTileLayerId = string & { __brand: 'public.tile_layers' };

/**
 * Represents the table public.tile_layers
 * Goal: Bring your own raster tile layers as xyz url templates. Versioned like wms_layers. Added by writers or higher.
 */
export default interface TileLayers {
  tile_layer_id: TileLayersTileLayerId;

  project_id: ProjectsProjectId;

  label: string | null;

  /** Leaflet TileLayer url. Supports {z}/{x}/{y}, {r} (retina) and {s} (subdomains). Api keys are part of the template and therefore public in the client. */
  url_template: string | null;

  /** Array of subdomain characters for the {s} placeholder, e.g. ["a","b","c","d"]. Null: leaflet default abc */
  subdomains: unknown | null;

  /** Highest zoom level the provider serves tiles for. Leaflet over-zooms beyond it. Null: no limit */
  max_native_zoom: number | null;

  attribution: string | null;

  /** If true: offered in the Hintergrundkarte section as a base map (radio semantics, visibility = render list membership). If false: a stackable layer like wms layers */
  is_background: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.tile_layers
 * Goal: Bring your own raster tile layers as xyz url templates. Versioned like wms_layers. Added by writers or higher.
 */
export interface TileLayersInitializer {
  /** Default value: uuidv7() */
  tile_layer_id?: TileLayersTileLayerId;

  project_id: ProjectsProjectId;

  label?: string | null;

  /** Leaflet TileLayer url. Supports {z}/{x}/{y}, {r} (retina) and {s} (subdomains). Api keys are part of the template and therefore public in the client. */
  url_template?: string | null;

  /** Array of subdomain characters for the {s} placeholder, e.g. ["a","b","c","d"]. Null: leaflet default abc */
  subdomains?: unknown | null;

  /** Highest zoom level the provider serves tiles for. Leaflet over-zooms beyond it. Null: no limit */
  max_native_zoom?: number | null;

  attribution?: string | null;

  /**
   * If true: offered in the Hintergrundkarte section as a base map (radio semantics, visibility = render list membership). If false: a stackable layer like wms layers
   * Default value: false
   */
  is_background?: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.tile_layers
 * Goal: Bring your own raster tile layers as xyz url templates. Versioned like wms_layers. Added by writers or higher.
 */
export interface TileLayersMutator {
  tile_layer_id?: TileLayersTileLayerId;

  project_id?: ProjectsProjectId;

  label?: string | null;

  /** Leaflet TileLayer url. Supports {z}/{x}/{y}, {r} (retina) and {s} (subdomains). Api keys are part of the template and therefore public in the client. */
  url_template?: string | null;

  /** Array of subdomain characters for the {s} placeholder, e.g. ["a","b","c","d"]. Null: leaflet default abc */
  subdomains?: unknown | null;

  /** Highest zoom level the provider serves tiles for. Leaflet over-zooms beyond it. Null: no limit */
  max_native_zoom?: number | null;

  attribution?: string | null;

  /** If true: offered in the Hintergrundkarte section as a base map (radio semantics, visibility = render list membership). If false: a stackable layer like wms layers */
  is_background?: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}