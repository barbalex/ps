import type { PlacesPlaceId } from './Places.ts';
import type { ProjectUsersProjectUserId } from './ProjectUsers.ts';
import type { default as UserRolesEnum } from './UserRolesEnum.ts';

/** Identifier type for public.place_roles */
export type PlaceRolesPlaceRoleId = string & { __brand: 'public.place_roles' };

/**
 * Represents the table public.place_roles
 * Role assignments at place scope. One role per project_user per place
 */
export default interface PlaceRoles {
  place_role_id: PlaceRolesPlaceRoleId;

  place_id: PlacesPlaceId | null;

  project_user_id: ProjectUsersProjectUserId;

  /** One of: "read-specific", "read-all", "write-specific", "write-all", "design", "own". Only triggers may set "own" */
  role: UserRolesEnum;

  /** Maintained by trigger: directory email + role */
  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.place_roles
 * Role assignments at place scope. One role per project_user per place
 */
export interface PlaceRolesInitializer {
  /** Default value: uuidv7() */
  place_role_id?: PlaceRolesPlaceRoleId;

  place_id?: PlacesPlaceId | null;

  project_user_id: ProjectUsersProjectUserId;

  /** One of: "read-specific", "read-all", "write-specific", "write-all", "design", "own". Only triggers may set "own" */
  role: UserRolesEnum;

  /** Maintained by trigger: directory email + role */
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
 * Represents the mutator for the table public.place_roles
 * Role assignments at place scope. One role per project_user per place
 */
export interface PlaceRolesMutator {
  place_role_id?: PlaceRolesPlaceRoleId;

  place_id?: PlacesPlaceId | null;

  project_user_id?: ProjectUsersProjectUserId;

  /** One of: "read-specific", "read-all", "write-specific", "write-all", "design", "own". Only triggers may set "own" */
  role?: UserRolesEnum;

  /** Maintained by trigger: directory email + role */
  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}