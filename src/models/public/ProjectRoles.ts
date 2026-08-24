import type { ProjectsProjectId } from './Projects.ts';
import type { ProjectUsersProjectUserId } from './ProjectUsers.ts';
import type { default as UserRolesEnum } from './UserRolesEnum.ts';

/** Identifier type for public.project_roles */
export type ProjectRolesProjectRoleId = string & { __brand: 'public.project_roles' };

/**
 * Represents the table public.project_roles
 * Role assignments at project scope. One role per project_user per scope
 */
export default interface ProjectRoles {
  project_role_id: ProjectRolesProjectRoleId;

  project_id: ProjectsProjectId | null;

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
 * Represents the initializer for the table public.project_roles
 * Role assignments at project scope. One role per project_user per scope
 */
export interface ProjectRolesInitializer {
  /** Default value: uuidv7() */
  project_role_id?: ProjectRolesProjectRoleId;

  project_id?: ProjectsProjectId | null;

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
 * Represents the mutator for the table public.project_roles
 * Role assignments at project scope. One role per project_user per scope
 */
export interface ProjectRolesMutator {
  project_role_id?: ProjectRolesProjectRoleId;

  project_id?: ProjectsProjectId | null;

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