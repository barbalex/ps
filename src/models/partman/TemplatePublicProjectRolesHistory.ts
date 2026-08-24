import type { default as public_UserRolesEnum } from '../public/UserRolesEnum.ts';

/** Represents the table partman.template_public_project_roles_history */
export default interface TemplatePublicProjectRolesHistory {
  project_role_id: string;

  project_id: string | null;

  project_user_id: string;

  role: public_UserRolesEnum;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_project_roles_history */
export interface TemplatePublicProjectRolesHistoryInitializer {
  project_role_id: string;

  project_id?: string | null;

  project_user_id: string;

  role: public_UserRolesEnum;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_project_roles_history */
export interface TemplatePublicProjectRolesHistoryMutator {
  project_role_id?: string;

  project_id?: string | null;

  project_user_id?: string;

  role?: public_UserRolesEnum;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}