import type { SubprojectsSubprojectId } from './Subprojects.js';
import type { UsersUserId } from './Users.js';
import type { default as UserRolesEnum } from './UserRolesEnum.js';

/** Identifier type for public.subproject_users */
export type SubprojectUsersSubprojectUserId = string & { __brand: 'public.subproject_users' };

/**
 * Represents the table public.subproject_users
 * A way to give users access to subprojects (without giving them access to the whole project). TODO: define what data from the project the user can see.
 */
export default interface SubprojectUsers {
  subproject_user_id: SubprojectUsersSubprojectUserId;

  subproject_id: SubprojectsSubprojectId | null;

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
 * Represents the initializer for the table public.subproject_users
 * A way to give users access to subprojects (without giving them access to the whole project). TODO: define what data from the project the user can see.
 */
export interface SubprojectUsersInitializer {
  /** Default value: uuid_generate_v7() */
  subproject_user_id?: SubprojectUsersSubprojectUserId;

  subproject_id?: SubprojectsSubprojectId | null;

  user_id?: UsersUserId | null;

  /** One of: "read-specific", "read-all", "write-specific", "write-all", "design", "own". Preset: "read-all" */
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
 * Represents the mutator for the table public.subproject_users
 * A way to give users access to subprojects (without giving them access to the whole project). TODO: define what data from the project the user can see.
 */
export interface SubprojectUsersMutator {
  subproject_user_id?: SubprojectUsersSubprojectUserId;

  subproject_id?: SubprojectsSubprojectId | null;

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