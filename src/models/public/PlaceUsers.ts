import type { PlacesPlaceId } from './Places.js';
import type { UsersUserId } from './Users.js';
import type { default as UserRolesEnum } from './UserRolesEnum.js';

/** Identifier type for public.place_users */
export type PlaceUsersPlaceUserId = string & { __brand: 'public.place_users' };

/**
 * Represents the table public.place_users
 * A way to give users access to places without giving them access to the whole project or subproject.
 */
export default interface PlaceUsers {
  place_user_id: PlaceUsersPlaceUserId;

  place_id: PlacesPlaceId | null;

  user_id: UsersUserId | null;

  /** One of: "read-specific", "read-all", "write-specific", "write-all", "design", "own". Preset: "read-all" */
  role: UserRolesEnum | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.place_users
 * A way to give users access to places without giving them access to the whole project or subproject.
 */
export interface PlaceUsersInitializer {
  /** Default value: uuid_generate_v7() */
  place_user_id?: PlaceUsersPlaceUserId;

  place_id?: PlacesPlaceId | null;

  user_id?: UsersUserId | null;

  /**
   * One of: "read-specific", "read-all", "write-specific", "write-all", "design", "own". Preset: "read-all"
   * Default value: 'read-all'::user_roles_enum
   */
  role?: UserRolesEnum | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.place_users
 * A way to give users access to places without giving them access to the whole project or subproject.
 */
export interface PlaceUsersMutator {
  place_user_id?: PlaceUsersPlaceUserId;

  place_id?: PlacesPlaceId | null;

  user_id?: UsersUserId | null;

  /** One of: "read-specific", "read-all", "write-specific", "write-all", "design", "own". Preset: "read-all" */
  role?: UserRolesEnum | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}