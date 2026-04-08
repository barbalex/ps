/**
 * Represents the table public.action_reports_history
 * System-versioned history of action_reports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ActionReportsHistory {
  place_action_report_id: string;

  account_id: string | null;

  place_id: string | null;

  year: number | null;

  data: unknown | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.action_reports_history
 * System-versioned history of action_reports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ActionReportsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  place_action_report_id?: string;

  account_id?: string | null;

  place_id?: string | null;

  /** Default value: date_part('year'::text, (now())::date) */
  year?: number | null;

  data?: unknown | null;

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
 * Represents the mutator for the table public.action_reports_history
 * System-versioned history of action_reports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ActionReportsHistoryMutator {
  place_action_report_id?: string;

  account_id?: string | null;

  place_id?: string | null;

  year?: number | null;

  data?: unknown | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}