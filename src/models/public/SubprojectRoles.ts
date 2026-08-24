import type { SubprojectsSubprojectId } from './Subprojects.ts';
import type { ProjectUsersProjectUserId } from './ProjectUsers.ts';
import type { default as UserRolesEnum } from './UserRolesEnum.ts';

/** Identifier type for public.subproject_roles */
export type SubprojectRolesSubprojectRoleId = string & { __brand: 'public.subproject_roles' };

/**
 * Represents the table public.subproject_roles
 * Role assignments at subproject scope. One role per project_user per scope
 */
export default interface SubprojectRoles {
  subproject_role_id: SubprojectRolesSubprojectRoleId;

  subproject_id: SubprojectsSubprojectId | null;

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
 * Represents the initializer for the table public.subproject_roles
 * Role assignments at subproject scope. One role per project_user per scope
 */
export interface SubprojectRolesInitializer {
  /** Default value: uuidv7() */
  subproject_role_id?: SubprojectRolesSubprojectRoleId;

  subproject_id?: SubprojectsSubprojectId | null;

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
 * Represents the mutator for the table public.subproject_roles
 * Role assignments at subproject scope. One role per project_user per scope
 */
export interface SubprojectRolesMutator {
  subproject_role_id?: SubprojectRolesSubprojectRoleId;

  subproject_id?: SubprojectsSubprojectId | null;

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