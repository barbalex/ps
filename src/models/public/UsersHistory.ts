/**
 * Represents the table public.users_history
 * System-versioned history of users. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface UsersHistory {
  user_id: string;

  id: string | null;

  name: string | null;

  email: string | null;

  email_verified: boolean | null;

  two_factor_enabled: boolean | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;
}

/**
 * Represents the initializer for the table public.users_history
 * System-versioned history of users. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface UsersHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  user_id?: string;

  id?: string | null;

  name?: string | null;

  email?: string | null;

  /** Default value: false */
  email_verified?: boolean | null;

  /** Default value: false */
  two_factor_enabled?: boolean | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;
}

/**
 * Represents the mutator for the table public.users_history
 * System-versioned history of users. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface UsersHistoryMutator {
  user_id?: string;

  id?: string | null;

  name?: string | null;

  email?: string | null;

  email_verified?: boolean | null;

  two_factor_enabled?: boolean | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;
}