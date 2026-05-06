/**
 * Represents the table public.qc_assignments_history
 * System-versioned history of qc_assignments. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface QcAssignmentsHistory {
  qc_assignment_id: string;

  project_id: string | null;

  subproject_id: string | null;

  qc_id: string;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.qc_assignments_history
 * System-versioned history of qc_assignments. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface QcAssignmentsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  qc_assignment_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  qc_id: string;

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
 * Represents the mutator for the table public.qc_assignments_history
 * System-versioned history of qc_assignments. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface QcAssignmentsHistoryMutator {
  qc_assignment_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  qc_id?: string;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}