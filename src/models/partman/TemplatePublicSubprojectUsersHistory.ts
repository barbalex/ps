import type { default as public_UserRolesEnum } from '../public/UserRolesEnum.js';

/** Represents the table partman.template_public_subproject_users_history */
export default interface TemplatePublicSubprojectUsersHistory {
  subproject_user_id: string;

  subproject_id: string | null;

  user_id: string | null;

  role: public_UserRolesEnum | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_subproject_users_history */
export interface TemplatePublicSubprojectUsersHistoryInitializer {
  subproject_user_id: string;

  subproject_id?: string | null;

  user_id?: string | null;

  role?: public_UserRolesEnum | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_subproject_users_history */
export interface TemplatePublicSubprojectUsersHistoryMutator {
  subproject_user_id?: string;

  subproject_id?: string | null;

  user_id?: string | null;

  role?: public_UserRolesEnum | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}