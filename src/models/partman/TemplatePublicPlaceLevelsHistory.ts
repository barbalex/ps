/** Represents the table partman.template_public_place_levels_history */
export default interface TemplatePublicPlaceLevelsHistory {
  place_level_id: string;

  project_id: string | null;

  level: number | null;

  name_singular_de: string | null;

  name_plural_de: string | null;

  name_singular_en: string | null;

  name_plural_en: string | null;

  name_singular_fr: string | null;

  name_plural_fr: string | null;

  name_singular_it: string | null;

  name_plural_it: string | null;

  check_reports: boolean | null;

  check_report_quantities: boolean | null;

  check_report_quantities_in_report: boolean | null;

  action_reports: boolean | null;

  action_report_quantities: boolean | null;

  action_report_quantities_in_report: boolean | null;

  actions: boolean | null;

  action_quantities: boolean | null;

  action_quantities_in_action: boolean | null;

  action_taxa: boolean | null;

  action_taxa_in_action: boolean | null;

  checks: boolean | null;

  check_quantities: boolean | null;

  check_quantities_in_check: boolean | null;

  check_taxa: boolean | null;

  check_taxa_in_check: boolean | null;

  observations: boolean | null;

  place_users_in_place: boolean | null;

  place_files: boolean | null;

  place_files_in_place: boolean | null;

  action_files: boolean | null;

  action_files_in_action: boolean | null;

  check_files: boolean | null;

  check_files_in_check: boolean | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_place_levels_history */
export interface TemplatePublicPlaceLevelsHistoryInitializer {
  place_level_id: string;

  project_id?: string | null;

  level?: number | null;

  name_singular_de?: string | null;

  name_plural_de?: string | null;

  name_singular_en?: string | null;

  name_plural_en?: string | null;

  name_singular_fr?: string | null;

  name_plural_fr?: string | null;

  name_singular_it?: string | null;

  name_plural_it?: string | null;

  check_reports?: boolean | null;

  check_report_quantities?: boolean | null;

  check_report_quantities_in_report?: boolean | null;

  action_reports?: boolean | null;

  action_report_quantities?: boolean | null;

  action_report_quantities_in_report?: boolean | null;

  actions?: boolean | null;

  action_quantities?: boolean | null;

  action_quantities_in_action?: boolean | null;

  action_taxa?: boolean | null;

  action_taxa_in_action?: boolean | null;

  checks?: boolean | null;

  check_quantities?: boolean | null;

  check_quantities_in_check?: boolean | null;

  check_taxa?: boolean | null;

  check_taxa_in_check?: boolean | null;

  observations?: boolean | null;

  place_users_in_place?: boolean | null;

  place_files?: boolean | null;

  place_files_in_place?: boolean | null;

  action_files?: boolean | null;

  action_files_in_action?: boolean | null;

  check_files?: boolean | null;

  check_files_in_check?: boolean | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_place_levels_history */
export interface TemplatePublicPlaceLevelsHistoryMutator {
  place_level_id?: string;

  project_id?: string | null;

  level?: number | null;

  name_singular_de?: string | null;

  name_plural_de?: string | null;

  name_singular_en?: string | null;

  name_plural_en?: string | null;

  name_singular_fr?: string | null;

  name_plural_fr?: string | null;

  name_singular_it?: string | null;

  name_plural_it?: string | null;

  check_reports?: boolean | null;

  check_report_quantities?: boolean | null;

  check_report_quantities_in_report?: boolean | null;

  action_reports?: boolean | null;

  action_report_quantities?: boolean | null;

  action_report_quantities_in_report?: boolean | null;

  actions?: boolean | null;

  action_quantities?: boolean | null;

  action_quantities_in_action?: boolean | null;

  action_taxa?: boolean | null;

  action_taxa_in_action?: boolean | null;

  checks?: boolean | null;

  check_quantities?: boolean | null;

  check_quantities_in_check?: boolean | null;

  check_taxa?: boolean | null;

  check_taxa_in_check?: boolean | null;

  observations?: boolean | null;

  place_users_in_place?: boolean | null;

  place_files?: boolean | null;

  place_files_in_place?: boolean | null;

  action_files?: boolean | null;

  action_files_in_action?: boolean | null;

  check_files?: boolean | null;

  check_files_in_check?: boolean | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}