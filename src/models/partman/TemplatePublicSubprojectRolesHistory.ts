import type { default as public_UserRolesEnum } from '../public/UserRolesEnum.ts';

/** Represents the table partman.template_public_subproject_roles_history */
export default interface TemplatePublicSubprojectRolesHistory {
  subproject_role_id: string;

  subproject_id: string | null;

  project_user_id: string;

  role: public_UserRolesEnum;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_subproject_roles_history */
export interface TemplatePublicSubprojectRolesHistoryInitializer {
  subproject_role_id: string;

  subproject_id?: string | null;

  project_user_id: string;

  role: public_UserRolesEnum;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_subproject_roles_history */
export interface TemplatePublicSubprojectRolesHistoryMutator {
  subproject_role_id?: string;

  subproject_id?: string | null;

  project_user_id?: string;

  role?: public_UserRolesEnum;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}