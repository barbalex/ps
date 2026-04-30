import type { default as public_UserRolesEnum } from '../public/UserRolesEnum.js';

/** Represents the table partman.template_public_project_users_history */
export default interface TemplatePublicProjectUsersHistory {
  project_user_id: string;

  project_id: string | null;

  user_id: string | null;

  role: public_UserRolesEnum | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_project_users_history */
export interface TemplatePublicProjectUsersHistoryInitializer {
  project_user_id: string;

  project_id?: string | null;

  user_id?: string | null;

  role?: public_UserRolesEnum | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_project_users_history */
export interface TemplatePublicProjectUsersHistoryMutator {
  project_user_id?: string;

  project_id?: string | null;

  user_id?: string | null;

  role?: public_UserRolesEnum | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}