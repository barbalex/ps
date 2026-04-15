/**
 * Represents the table public.project_reports_history
 * System-versioned history of project_reports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ProjectReportsHistory {
  project_report_id: string;

  project_id: string | null;

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
 * Represents the initializer for the table public.project_reports_history
 * System-versioned history of project_reports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectReportsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  project_report_id?: string;

  project_id?: string | null;

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
 * Represents the mutator for the table public.project_reports_history
 * System-versioned history of project_reports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectReportsHistoryMutator {
  project_report_id?: string;

  project_id?: string | null;

  year?: number | null;

  data?: unknown | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}