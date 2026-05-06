/**
 * Represents the table public.project_export_assignments_history
 * System-versioned history of project_export_assignments. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ProjectExportAssignmentsHistory {
  project_export_assignment_id: string;

  project_id: string | null;

  subproject_id: string | null;

  project_exports_id: string;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_export_assignments_history
 * System-versioned history of project_export_assignments. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectExportAssignmentsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  project_export_assignment_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  project_exports_id: string;

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
 * Represents the mutator for the table public.project_export_assignments_history
 * System-versioned history of project_export_assignments. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectExportAssignmentsHistoryMutator {
  project_export_assignment_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  project_exports_id?: string;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}