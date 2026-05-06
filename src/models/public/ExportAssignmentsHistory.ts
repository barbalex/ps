/**
 * Represents the table public.export_assignments_history
 * System-versioned history of export_assignments. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ExportAssignmentsHistory {
  export_assignment_id: string;

  project_id: string | null;

  subproject_id: string | null;

  exports_id: string;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.export_assignments_history
 * System-versioned history of export_assignments. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ExportAssignmentsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  export_assignment_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  exports_id: string;

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
 * Represents the mutator for the table public.export_assignments_history
 * System-versioned history of export_assignments. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ExportAssignmentsHistoryMutator {
  export_assignment_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  exports_id?: string;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}