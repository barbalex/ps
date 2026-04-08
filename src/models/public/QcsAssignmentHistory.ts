/**
 * Represents the table public.qcs_assignment_history
 * System-versioned history of qcs_assignment. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface QcsAssignmentHistory {
  qcs_assignment_id: string;

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
 * Represents the initializer for the table public.qcs_assignment_history
 * System-versioned history of qcs_assignment. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface QcsAssignmentHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  qcs_assignment_id?: string;

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
 * Represents the mutator for the table public.qcs_assignment_history
 * System-versioned history of qcs_assignment. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface QcsAssignmentHistoryMutator {
  qcs_assignment_id?: string;

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