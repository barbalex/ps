import type { ObservationImportsObservationImportId } from './ObservationImports.js';
import type { PlacesPlaceId } from './Places.js';

/** Identifier type for public.observations */
export type ObservationsObservationId = string & { __brand: 'public.observations' };

/**
 * Represents the table public.observations
 * observations. Imported for subprojects (species projects) or projects (biotope projects).
 */
export default interface Observations {
  observation_id: ObservationsObservationId;

  observation_import_id: ObservationImportsObservationImportId | null;

  /** The place this observation is assigned to. */
  place_id: PlacesPlaceId | null;

  not_to_assign: boolean | null;

  comment: string | null;

  /** data as received from GBIF */
  data: unknown | null;

  /** Used to replace previously imported observations */
  id_in_source: string | null;

  /** geometry of observation. Extracted from data to show the observation on a map */
  geometry: unknown | null;

  /** label of observation, used to show it in the UI. Created on import */
  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.observations
 * observations. Imported for subprojects (species projects) or projects (biotope projects).
 */
export interface ObservationsInitializer {
  /** Default value: uuid_generate_v7() */
  observation_id?: ObservationsObservationId;

  observation_import_id?: ObservationImportsObservationImportId | null;

  /** The place this observation is assigned to. */
  place_id?: PlacesPlaceId | null;

  /** Default value: false */
  not_to_assign?: boolean | null;

  comment?: string | null;

  /** data as received from GBIF */
  data?: unknown | null;

  /** Used to replace previously imported observations */
  id_in_source?: string | null;

  /**
   * geometry of observation. Extracted from data to show the observation on a map
   * Default value: NULL::geometry
   */
  geometry?: unknown | null;

  /** label of observation, used to show it in the UI. Created on import */
  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.observations
 * observations. Imported for subprojects (species projects) or projects (biotope projects).
 */
export interface ObservationsMutator {
  observation_id?: ObservationsObservationId;

  observation_import_id?: ObservationImportsObservationImportId | null;

  /** The place this observation is assigned to. */
  place_id?: PlacesPlaceId | null;

  not_to_assign?: boolean | null;

  comment?: string | null;

  /** data as received from GBIF */
  data?: unknown | null;

  /** Used to replace previously imported observations */
  id_in_source?: string | null;

  /** geometry of observation. Extracted from data to show the observation on a map */
  geometry?: unknown | null;

  /** label of observation, used to show it in the UI. Created on import */
  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}