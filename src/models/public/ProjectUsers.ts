import type { ProjectsProjectId } from './Projects.js';
import type { UsersUserId } from './Users.js';
import type { default as UserRolesEnum } from './UserRolesEnum.js';

/** Identifier type for public.project_users */
export type ProjectUsersProjectUserId = string & { __brand: 'public.project_users' };

/**
 * Represents the table public.project_users
 * A way to give users access to projects (without giving them access to the whole account).
 */
export default interface ProjectUsers {
  project_user_id: ProjectUsersProjectUserId;

  project_id: ProjectsProjectId | null;

  user_id: UsersUserId | null;

  /** One of: "reader", "writer", "designer", "owner". Preset: "reader" */
  role: UserRolesEnum | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_users
 * A way to give users access to projects (without giving them access to the whole account).
 */
export interface ProjectUsersInitializer {
  /** Default value: uuid_generate_v7() */
  project_user_id?: ProjectUsersProjectUserId;

  project_id?: ProjectsProjectId | null;

  user_id?: UsersUserId | null;

  /** One of: "reader", "writer", "designer", "owner". Preset: "reader" */
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
 * Represents the mutator for the table public.project_users
 * A way to give users access to projects (without giving them access to the whole account).
 */
export interface ProjectUsersMutator {
  project_user_id?: ProjectUsersProjectUserId;

  project_id?: ProjectsProjectId | null;

  user_id?: UsersUserId | null;

  /** One of: "reader", "writer", "designer", "owner". Preset: "reader" */
  role?: UserRolesEnum | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}