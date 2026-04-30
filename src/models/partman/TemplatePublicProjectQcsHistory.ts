/** Represents the table partman.template_public_project_qcs_history */
export default interface TemplatePublicProjectQcsHistory {
  project_qc_id: string;

  project_id: string;

  name: string | null;

  label_de: string | null;

  label_en: string | null;

  label_fr: string | null;

  label_it: string | null;

  description: string | null;

  sort: number | null;

  is_project_level: boolean | null;

  is_subproject_level: boolean | null;

  filter_by_year: boolean | null;

  sql: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_project_qcs_history */
export interface TemplatePublicProjectQcsHistoryInitializer {
  project_qc_id: string;

  project_id: string;

  name?: string | null;

  label_de?: string | null;

  label_en?: string | null;

  label_fr?: string | null;

  label_it?: string | null;

  description?: string | null;

  sort?: number | null;

  is_project_level?: boolean | null;

  is_subproject_level?: boolean | null;

  filter_by_year?: boolean | null;

  sql?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_project_qcs_history */
export interface TemplatePublicProjectQcsHistoryMutator {
  project_qc_id?: string;

  project_id?: string;

  name?: string | null;

  label_de?: string | null;

  label_en?: string | null;

  label_fr?: string | null;

  label_it?: string | null;

  description?: string | null;

  sort?: number | null;

  is_project_level?: boolean | null;

  is_subproject_level?: boolean | null;

  filter_by_year?: boolean | null;

  sql?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}