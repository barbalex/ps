import type { default as UserRolesEnum } from './UserRolesEnum.js';

/**
 * Represents the table public.place_users_history
 * System-versioned history of place_users. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface PlaceUsersHistory {
  place_user_id: string;

  account_id: string | null;

  place_id: string | null;

  user_id: string | null;

  role: UserRolesEnum | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.place_users_history
 * System-versioned history of place_users. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface PlaceUsersHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  place_user_id?: string;

  account_id?: string | null;

  place_id?: string | null;

  user_id?: string | null;

  /** Default value: 'reader'::user_roles_enum */
  role?: UserRolesEnum | null;

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
 * Represents the mutator for the table public.place_users_history
 * System-versioned history of place_users. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface PlaceUsersHistoryMutator {
  place_user_id?: string;

  account_id?: string | null;

  place_id?: string | null;

  user_id?: string | null;

  role?: UserRolesEnum | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}