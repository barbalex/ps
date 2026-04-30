/** Represents the table partman.template_public_project_report_subdesigns_history */
export default interface TemplatePublicProjectReportSubdesignsHistory {
  project_report_subdesign_id: string;

  project_id: string | null;

  name: string | null;

  design: unknown | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_project_report_subdesigns_history */
export interface TemplatePublicProjectReportSubdesignsHistoryInitializer {
  project_report_subdesign_id: string;

  project_id?: string | null;

  name?: string | null;

  design?: unknown | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_project_report_subdesigns_history */
export interface TemplatePublicProjectReportSubdesignsHistoryMutator {
  project_report_subdesign_id?: string;

  project_id?: string | null;

  name?: string | null;

  design?: unknown | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}