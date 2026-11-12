/**
 * Represents the table public.form_designs_history
 * System-versioned history of form_designs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface FormDesignsHistory {
  form_design_id: string;

  project_id: string;

  table_name: string;

  table_view_id: string | null;

  active: boolean;

  design: unknown | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.form_designs_history
 * System-versioned history of form_designs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface FormDesignsHistoryInitializer {
  /** Default value: uuidv7() */
  form_design_id?: string;

  project_id: string;

  table_name: string;

  table_view_id?: string | null;

  /** Default value: false */
  active?: boolean;

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
 * Represents the mutator for the table public.form_designs_history
 * System-versioned history of form_designs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface FormDesignsHistoryMutator {
  form_design_id?: string;

  project_id?: string;

  table_name?: string;

  table_view_id?: string | null;

  active?: boolean;

  design?: unknown | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}