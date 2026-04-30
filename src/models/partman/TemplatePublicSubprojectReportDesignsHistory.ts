/** Represents the table partman.template_public_subproject_report_designs_history */
export default interface TemplatePublicSubprojectReportDesignsHistory {
  subproject_report_design_id: string;

  project_id: string | null;

  name: string | null;

  label: string | null;

  active: boolean | null;

  design: unknown | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_subproject_report_designs_history */
export interface TemplatePublicSubprojectReportDesignsHistoryInitializer {
  subproject_report_design_id: string;

  project_id?: string | null;

  name?: string | null;

  label?: string | null;

  active?: boolean | null;

  design?: unknown | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_subproject_report_designs_history */
export interface TemplatePublicSubprojectReportDesignsHistoryMutator {
  subproject_report_design_id?: string;

  project_id?: string | null;

  name?: string | null;

  label?: string | null;

  active?: boolean | null;

  design?: unknown | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}