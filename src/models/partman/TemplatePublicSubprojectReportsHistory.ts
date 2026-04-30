/** Represents the table partman.template_public_subproject_reports_history */
export default interface TemplatePublicSubprojectReportsHistory {
  subproject_report_id: string;

  subproject_id: string | null;

  year: number | null;

  data: unknown | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_subproject_reports_history */
export interface TemplatePublicSubprojectReportsHistoryInitializer {
  subproject_report_id: string;

  subproject_id?: string | null;

  year?: number | null;

  data?: unknown | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_subproject_reports_history */
export interface TemplatePublicSubprojectReportsHistoryMutator {
  subproject_report_id?: string;

  subproject_id?: string | null;

  year?: number | null;

  data?: unknown | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}