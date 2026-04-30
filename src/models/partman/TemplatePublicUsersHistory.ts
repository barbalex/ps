/** Represents the table partman.template_public_users_history */
export default interface TemplatePublicUsersHistory {
  user_id: string;

  id: string | null;

  name: string | null;

  email: string | null;

  image: string | null;

  email_verified: boolean | null;

  two_factor_enabled: boolean | null;

  label: string | null;

  project_fields_in_account: boolean | null;

  accounts_in_user: boolean | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;
}

/** Represents the initializer for the table partman.template_public_users_history */
export interface TemplatePublicUsersHistoryInitializer {
  user_id: string;

  id?: string | null;

  name?: string | null;

  email?: string | null;

  image?: string | null;

  email_verified?: boolean | null;

  two_factor_enabled?: boolean | null;

  label?: string | null;

  project_fields_in_account?: boolean | null;

  accounts_in_user?: boolean | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;
}

/** Represents the mutator for the table partman.template_public_users_history */
export interface TemplatePublicUsersHistoryMutator {
  user_id?: string;

  id?: string | null;

  name?: string | null;

  email?: string | null;

  image?: string | null;

  email_verified?: boolean | null;

  two_factor_enabled?: boolean | null;

  label?: string | null;

  project_fields_in_account?: boolean | null;

  accounts_in_user?: boolean | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;
}