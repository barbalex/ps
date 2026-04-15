import type { PlacesPlaceId } from './Places.js';

/** Identifier type for public.actions */
export type ActionsActionId = string & { __brand: 'public.actions' };

/**
 * Represents the table public.actions
 * Actions are what is done to improve the situation of (promote) the subproject in this place.
 */
export default interface Actions {
  action_id: ActionsActionId;

  place_id: PlacesPlaceId | null;

  date: Date | null;

  /** Room for action specific data, defined in "fields" table */
  data: unknown | null;

  /** geometry of action */
  geometry: unknown | null;

  /** bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries for viewport client-side */
  bbox: unknown | null;

  /** Whether action is relevant for reports. Preset: true */
  relevant_for_reports: boolean | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.actions
 * Actions are what is done to improve the situation of (promote) the subproject in this place.
 */
export interface ActionsInitializer {
  /** Default value: uuid_generate_v7() */
  action_id?: ActionsActionId;

  place_id?: PlacesPlaceId | null;

  /** Default value: CURRENT_DATE */
  date?: Date | null;

  /** Room for action specific data, defined in "fields" table */
  data?: unknown | null;

  /**
   * geometry of action
   * Default value: NULL::geometry
   */
  geometry?: unknown | null;

  /** bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries for viewport client-side */
  bbox?: unknown | null;

  /**
   * Whether action is relevant for reports. Preset: true
   * Default value: true
   */
  relevant_for_reports?: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.actions
 * Actions are what is done to improve the situation of (promote) the subproject in this place.
 */
export interface ActionsMutator {
  action_id?: ActionsActionId;

  place_id?: PlacesPlaceId | null;

  date?: Date | null;

  /** Room for action specific data, defined in "fields" table */
  data?: unknown | null;

  /** geometry of action */
  geometry?: unknown | null;

  /** bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries for viewport client-side */
  bbox?: unknown | null;

  /** Whether action is relevant for reports. Preset: true */
  relevant_for_reports?: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}