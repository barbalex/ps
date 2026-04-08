/**
 * Represents the table public.subproject_report_designs_history
 * System-versioned history of subproject_report_designs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface SubprojectReportDesignsHistory {
  subproject_report_design_id: string;

  account_id: string | null;

  project_id: string | null;

  name: string | null;

  label: string | null;

  active: boolean | null;

  design: unknown | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.subproject_report_designs_history
 * System-versioned history of subproject_report_designs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface SubprojectReportDesignsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  subproject_report_design_id?: string;

  account_id?: string | null;

  project_id?: string | null;

  name?: string | null;

  label?: string | null;

  /** Default value: false */
  active?: boolean | null;

  design?: unknown | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.subproject_report_designs_history
 * System-versioned history of subproject_report_designs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface SubprojectReportDesignsHistoryMutator {
  subproject_report_design_id?: string;

  account_id?: string | null;

  project_id?: string | null;

  name?: string | null;

  label?: string | null;

  active?: boolean | null;

  design?: unknown | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}