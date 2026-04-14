/** Identifier type for public.users */
export type UsersUserId = string & { __brand: 'public.users' };

/**
 * Represents the table public.users
 * Goal: manage users and authorize them
 */
export default interface Users {
  user_id: UsersUserId;

  id: string | null;

  /** Users chosen display name */
  name: string | null;

  /** Users email address for communication and login. Needs to be unique. Project manager can list project user by email before this user creates an own login (thus has no user_id yet) */
  email: string | null;

  /** Whether the users email is verified */
  email_verified: boolean | null;

  /** Whether two-factor authentication is enabled for the user */
  two_factor_enabled: boolean | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;
}

/**
 * Represents the initializer for the table public.users
 * Goal: manage users and authorize them
 */
export interface UsersInitializer {
  /** Default value: uuid_generate_v7() */
  user_id?: UsersUserId;

  id?: string | null;

  /** Users chosen display name */
  name?: string | null;

  /** Users email address for communication and login. Needs to be unique. Project manager can list project user by email before this user creates an own login (thus has no user_id yet) */
  email?: string | null;

  /**
   * Whether the users email is verified
   * Default value: false
   */
  email_verified?: boolean | null;

  /**
   * Whether two-factor authentication is enabled for the user
   * Default value: false
   */
  two_factor_enabled?: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;
}

/**
 * Represents the mutator for the table public.users
 * Goal: manage users and authorize them
 */
export interface UsersMutator {
  user_id?: UsersUserId;

  id?: string | null;

  /** Users chosen display name */
  name?: string | null;

  /** Users email address for communication and login. Needs to be unique. Project manager can list project user by email before this user creates an own login (thus has no user_id yet) */
  email?: string | null;

  /** Whether the users email is verified */
  email_verified?: boolean | null;

  /** Whether two-factor authentication is enabled for the user */
  two_factor_enabled?: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;
}