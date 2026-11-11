/**
 * Represents the table partman.template_public_field_groups_history
 * System-versioned history of field_groups. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface TemplatePublicFieldGroupsHistory {
  field_group_id: string;

  project_id: string | null;

  table_name: string | null;

  name: string | null;

  sorted_field_ids: string[] | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table partman.template_public_field_groups_history
 * System-versioned history of field_groups. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface TemplatePublicFieldGroupsHistoryInitializer {
  field_group_id?: string;

  project_id?: string | null;

  table_name?: string | null;

  name?: string | null;

  sorted_field_ids?: string[] | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table partman.template_public_field_groups_history
 * System-versioned history of field_groups. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface TemplatePublicFieldGroupsHistoryMutator {
  field_group_id?: string;

  project_id?: string | null;

  table_name?: string | null;

  name?: string | null;

  sorted_field_ids?: string[] | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}
