/**
 * Represents the table public.project_qcs_history
 * System-versioned history of project_qcs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ProjectQcsHistory {
  project_qc_id: string;

  project_id: string;

  label_de: string | null;

  label_en: string | null;

  label_fr: string | null;

  label_it: string | null;

  description: string | null;

  sort: number | null;

  is_project_level: boolean | null;

  is_subproject_level: boolean | null;

  filter_by_year: boolean | null;

  sql: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_qcs_history
 * System-versioned history of project_qcs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectQcsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  project_qc_id?: string;

  project_id: string;

  label_de?: string | null;

  label_en?: string | null;

  label_fr?: string | null;

  label_it?: string | null;

  description?: string | null;

  sort?: number | null;

  /** Default value: false */
  is_project_level?: boolean | null;

  /** Default value: false */
  is_subproject_level?: boolean | null;

  /** Default value: false */
  filter_by_year?: boolean | null;

  sql?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.project_qcs_history
 * System-versioned history of project_qcs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectQcsHistoryMutator {
  project_qc_id?: string;

  project_id?: string;

  label_de?: string | null;

  label_en?: string | null;

  label_fr?: string | null;

  label_it?: string | null;

  description?: string | null;

  sort?: number | null;

  is_project_level?: boolean | null;

  is_subproject_level?: boolean | null;

  filter_by_year?: boolean | null;

  sql?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}