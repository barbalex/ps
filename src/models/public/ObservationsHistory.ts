/**
 * Represents the table public.observations_history
 * System-versioned history of observations. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ObservationsHistory {
  observation_id: string;

  observation_import_id: string | null;

  place_id: string | null;

  not_to_assign: boolean | null;

  comment: string | null;

  data: unknown | null;

  id_in_source: string | null;

  geometry: unknown | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.observations_history
 * System-versioned history of observations. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ObservationsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  observation_id?: string;

  observation_import_id?: string | null;

  place_id?: string | null;

  /** Default value: false */
  not_to_assign?: boolean | null;

  comment?: string | null;

  data?: unknown | null;

  id_in_source?: string | null;

  /** Default value: NULL::geometry */
  geometry?: unknown | null;

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
 * Represents the mutator for the table public.observations_history
 * System-versioned history of observations. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ObservationsHistoryMutator {
  observation_id?: string;

  observation_import_id?: string | null;

  place_id?: string | null;

  not_to_assign?: boolean | null;

  comment?: string | null;

  data?: unknown | null;

  id_in_source?: string | null;

  geometry?: unknown | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}