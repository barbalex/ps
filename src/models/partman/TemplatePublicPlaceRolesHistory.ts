import type { default as public_UserRolesEnum } from '../public/UserRolesEnum.ts';

/** Represents the table partman.template_public_place_roles_history */
export default interface TemplatePublicPlaceRolesHistory {
  place_role_id: string;

  place_id: string | null;

  project_user_id: string;

  role: public_UserRolesEnum;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_place_roles_history */
export interface TemplatePublicPlaceRolesHistoryInitializer {
  place_role_id: string;

  place_id?: string | null;

  project_user_id: string;

  role: public_UserRolesEnum;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_place_roles_history */
export interface TemplatePublicPlaceRolesHistoryMutator {
  place_role_id?: string;

  place_id?: string | null;

  project_user_id?: string;

  role?: public_UserRolesEnum;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}