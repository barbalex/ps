/**
 * Represents the table public.qcs_history
 * System-versioned history of qcs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface QcsHistory {
  qcs_id: string;

  name: string | null;

  table_name: string | null;

  place_level: number | null;

  label_de: string | null;

  label_en: string | null;

  label_fr: string | null;

  label_it: string | null;

  description: string | null;

  sort: number | null;

  is_root_level: boolean | null;

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
 * Represents the initializer for the table public.qcs_history
 * System-versioned history of qcs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface QcsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  qcs_id?: string;

  name?: string | null;

  table_name?: string | null;

  place_level?: number | null;

  label_de?: string | null;

  label_en?: string | null;

  label_fr?: string | null;

  label_it?: string | null;

  description?: string | null;

  sort?: number | null;

  /** Default value: false */
  is_root_level?: boolean | null;

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
 * Represents the mutator for the table public.qcs_history
 * System-versioned history of qcs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface QcsHistoryMutator {
  qcs_id?: string;

  name?: string | null;

  table_name?: string | null;

  place_level?: number | null;

  label_de?: string | null;

  label_en?: string | null;

  label_fr?: string | null;

  label_it?: string | null;

  description?: string | null;

  sort?: number | null;

  is_root_level?: boolean | null;

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