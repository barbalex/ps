/** Represents the table partman.template_public_field_groups_history */
export default interface TemplatePublicFieldGroupsHistory {
  field_group_id: string;

  project_id: string | null;

  table_name: string | null;

  name: string | null;

  sorted_field_ids: unknown | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_field_groups_history */
export interface TemplatePublicFieldGroupsHistoryInitializer {
  field_group_id: string;

  project_id?: string | null;

  table_name?: string | null;

  name?: string | null;

  sorted_field_ids?: unknown | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_field_groups_history */
export interface TemplatePublicFieldGroupsHistoryMutator {
  field_group_id?: string;

  project_id?: string | null;

  table_name?: string | null;

  name?: string | null;

  sorted_field_ids?: unknown | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}