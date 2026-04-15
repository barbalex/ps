/**
 * Represents the table public.project_crs_history
 * System-versioned history of project_crs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ProjectCrsHistory {
  project_crs_id: string;

  crs_id: string | null;

  project_id: string | null;

  code: string | null;

  name: string | null;

  proj4: string | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_crs_history
 * System-versioned history of project_crs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectCrsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  project_crs_id?: string;

  crs_id?: string | null;

  project_id?: string | null;

  code?: string | null;

  name?: string | null;

  proj4?: string | null;

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
 * Represents the mutator for the table public.project_crs_history
 * System-versioned history of project_crs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectCrsHistoryMutator {
  project_crs_id?: string;

  crs_id?: string | null;

  project_id?: string | null;

  code?: string | null;

  name?: string | null;

  proj4?: string | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}