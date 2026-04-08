/**
 * Represents the table public.accounts_history
 * System-versioned history of accounts. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface AccountsHistory {
  account_id: string;

  user_id: string | null;

  type: string | null;

  period_start: Date | null;

  period_end: Date | null;

  projects_label_by: string | null;

  project_fields_in_account: boolean | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.accounts_history
 * System-versioned history of accounts. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface AccountsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  account_id?: string;

  user_id?: string | null;

  type?: string | null;

  /** Default value: CURRENT_DATE */
  period_start?: Date | null;

  period_end?: Date | null;

  projects_label_by?: string | null;

  /** Default value: true */
  project_fields_in_account?: boolean | null;

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
 * Represents the mutator for the table public.accounts_history
 * System-versioned history of accounts. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface AccountsHistoryMutator {
  account_id?: string;

  user_id?: string | null;

  type?: string | null;

  period_start?: Date | null;

  period_end?: Date | null;

  projects_label_by?: string | null;

  project_fields_in_account?: boolean | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}