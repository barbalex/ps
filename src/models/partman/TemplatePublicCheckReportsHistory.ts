/** Represents the table partman.template_public_check_reports_history */
export default interface TemplatePublicCheckReportsHistory {
  place_check_report_id: string;

  place_id: string | null;

  year: number | null;

  data: unknown | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_check_reports_history */
export interface TemplatePublicCheckReportsHistoryInitializer {
  place_check_report_id: string;

  place_id?: string | null;

  year?: number | null;

  data?: unknown | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_check_reports_history */
export interface TemplatePublicCheckReportsHistoryMutator {
  place_check_report_id?: string;

  place_id?: string | null;

  year?: number | null;

  data?: unknown | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}