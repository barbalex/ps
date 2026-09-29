/**
 * Represents the table public.filtered_views_history
 * System-versioned history of filtered_views. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface FilteredViewsHistory {
  filtered_view_id: string;

  project_id: string | null;

  table_name: string | null;

  name_singular_de: string | null;

  name_plural_de: string | null;

  name_singular_en: string | null;

  name_plural_en: string | null;

  name_singular_fr: string | null;

  name_plural_fr: string | null;

  name_singular_it: string | null;

  name_plural_it: string | null;

  filter: unknown | null;

  label_by: unknown | null;

  sort: number | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.filtered_views_history
 * System-versioned history of filtered_views. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface FilteredViewsHistoryInitializer {
  /** Default value: uuidv7() */
  filtered_view_id?: string;

  project_id?: string | null;

  table_name?: string | null;

  name_singular_de?: string | null;

  name_plural_de?: string | null;

  name_singular_en?: string | null;

  name_plural_en?: string | null;

  name_singular_fr?: string | null;

  name_plural_fr?: string | null;

  name_singular_it?: string | null;

  name_plural_it?: string | null;

  filter?: unknown | null;

  label_by?: unknown | null;

  /** Default value: 0 */
  sort?: number | null;

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
 * Represents the mutator for the table public.filtered_views_history
 * System-versioned history of filtered_views. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface FilteredViewsHistoryMutator {
  filtered_view_id?: string;

  project_id?: string | null;

  table_name?: string | null;

  name_singular_de?: string | null;

  name_plural_de?: string | null;

  name_singular_en?: string | null;

  name_plural_en?: string | null;

  name_singular_fr?: string | null;

  name_plural_fr?: string | null;

  name_singular_it?: string | null;

  name_plural_it?: string | null;

  filter?: unknown | null;

  label_by?: unknown | null;

  sort?: number | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}