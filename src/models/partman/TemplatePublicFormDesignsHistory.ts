/** Represents the table partman.template_public_form_designs_history */
export default interface TemplatePublicFormDesignsHistory {
  form_design_id: string;

  project_id: string;

  table_name: string;

  table_view_id: string | null;

  active: boolean;

  design: unknown | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_form_designs_history */
export interface TemplatePublicFormDesignsHistoryInitializer {
  form_design_id: string;

  project_id: string;

  table_name: string;

  table_view_id?: string | null;

  active: boolean;

  design?: unknown | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_form_designs_history */
export interface TemplatePublicFormDesignsHistoryMutator {
  form_design_id?: string;

  project_id?: string;

  table_name?: string;

  table_view_id?: string | null;

  active?: boolean;

  design?: unknown | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}