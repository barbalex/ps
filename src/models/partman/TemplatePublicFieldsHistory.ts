/** Represents the table partman.template_public_fields_history */
export default interface TemplatePublicFieldsHistory {
  field_id: string;

  project_id: string | null;

  account_id: string | null;

  table_name: string | null;

  level: number | null;

  field_type_id: string | null;

  widget_type_id: string | null;

  name: string | null;

  field_label: string | null;

  list_id: string | null;

  preset: string | null;

  obsolete: boolean | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_fields_history */
export interface TemplatePublicFieldsHistoryInitializer {
  field_id: string;

  project_id?: string | null;

  account_id?: string | null;

  table_name?: string | null;

  level?: number | null;

  field_type_id?: string | null;

  widget_type_id?: string | null;

  name?: string | null;

  field_label?: string | null;

  list_id?: string | null;

  preset?: string | null;

  obsolete?: boolean | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_fields_history */
export interface TemplatePublicFieldsHistoryMutator {
  field_id?: string;

  project_id?: string | null;

  account_id?: string | null;

  table_name?: string | null;

  level?: number | null;

  field_type_id?: string | null;

  widget_type_id?: string | null;

  name?: string | null;

  field_label?: string | null;

  list_id?: string | null;

  preset?: string | null;

  obsolete?: boolean | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}