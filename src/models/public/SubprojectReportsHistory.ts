/**
 * Represents the table public.subproject_reports_history
 * System-versioned history of subproject_reports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface SubprojectReportsHistory {
  subproject_report_id: string;

  subproject_id: string | null;

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
 * Represents the initializer for the table public.subproject_reports_history
 * System-versioned history of subproject_reports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface SubprojectReportsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  subproject_report_id?: string;

  subproject_id?: string | null;

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
 * Represents the mutator for the table public.subproject_reports_history
 * System-versioned history of subproject_reports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface SubprojectReportsHistoryMutator {
  subproject_report_id?: string;

  subproject_id?: string | null;

  year?: number | null;

  data?: unknown | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}