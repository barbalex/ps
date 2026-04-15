import type { default as UserRolesEnum } from './UserRolesEnum.js';

/**
 * Represents the table public.subproject_users_history
 * System-versioned history of subproject_users. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface SubprojectUsersHistory {
  subproject_user_id: string;

  subproject_id: string | null;

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
 * Represents the initializer for the table public.subproject_users_history
 * System-versioned history of subproject_users. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface SubprojectUsersHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  subproject_user_id?: string;

  subproject_id?: string | null;

  user_id?: string | null;

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
 * Represents the mutator for the table public.subproject_users_history
 * System-versioned history of subproject_users. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface SubprojectUsersHistoryMutator {
  subproject_user_id?: string;

  subproject_id?: string | null;

  user_id?: string | null;

  role?: UserRolesEnum | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}