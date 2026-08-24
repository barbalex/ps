import type { ProjectsProjectId } from './Projects.ts';
import type { UsersUserId } from './Users.ts';

/** Identifier type for public.project_users */
export type ProjectUsersProjectUserId = string & { __brand: 'public.project_users' };

/**
 * Represents the table public.project_users
 * Per-project directory of collaborators. Emails replace the former global user references. Roles live in project_roles/subproject_roles/place_roles
 */
export default interface ProjectUsers {
  project_user_id: ProjectUsersProjectUserId;

  project_id: ProjectsProjectId | null;

  /** Trimmed and lowercased by trigger. Unique within the project; may overlap across projects */
  email: string;

  /** Set when a logged-in user claims this directory row by matching email */
  auth_user_id: UsersUserId | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_users
 * Per-project directory of collaborators. Emails replace the former global user references. Roles live in project_roles/subproject_roles/place_roles
 */
export interface ProjectUsersInitializer {
  /** Default value: uuidv7() */
  project_user_id?: ProjectUsersProjectUserId;

  project_id?: ProjectsProjectId | null;

  /** Trimmed and lowercased by trigger. Unique within the project; may overlap across projects */
  email: string;

  /** Set when a logged-in user claims this directory row by matching email */
  auth_user_id?: UsersUserId | null;

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
 * Per-project directory of collaborators. Emails replace the former global user references. Roles live in project_roles/subproject_roles/place_roles
 */
export interface ProjectUsersMutator {
  project_user_id?: ProjectUsersProjectUserId;

  project_id?: ProjectsProjectId | null;

  /** Trimmed and lowercased by trigger. Unique within the project; may overlap across projects */
  email?: string;

  /** Set when a logged-in user claims this directory row by matching email */
  auth_user_id?: UsersUserId | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}