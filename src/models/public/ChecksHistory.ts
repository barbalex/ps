/**
 * Represents the table public.checks_history
 * System-versioned history of checks. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ChecksHistory {
  check_id: string;

  place_id: string | null;

  date: Date | null;

  data: unknown | null;

  geometry: unknown | null;

  bbox: unknown | null;

  relevant_for_reports: boolean | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.checks_history
 * System-versioned history of checks. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ChecksHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  check_id?: string;

  place_id?: string | null;

  /** Default value: CURRENT_DATE */
  date?: Date | null;

  data?: unknown | null;

  /** Default value: NULL::geometry */
  geometry?: unknown | null;

  bbox?: unknown | null;

  /** Default value: true */
  relevant_for_reports?: boolean | null;

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
 * Represents the mutator for the table public.checks_history
 * System-versioned history of checks. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ChecksHistoryMutator {
  check_id?: string;

  place_id?: string | null;

  date?: Date | null;

  data?: unknown | null;

  geometry?: unknown | null;

  bbox?: unknown | null;

  relevant_for_reports?: boolean | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}