/** Represents the table partman.template_public_project_export_assignments_history */
export default interface TemplatePublicProjectExportAssignmentsHistory {
  project_export_assignment_id: string;

  project_id: string | null;

  subproject_id: string | null;

  project_exports_id: string;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_project_export_assignments_history */
export interface TemplatePublicProjectExportAssignmentsHistoryInitializer {
  project_export_assignment_id: string;

  project_id?: string | null;

  subproject_id?: string | null;

  project_exports_id: string;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_project_export_assignments_history */
export interface TemplatePublicProjectExportAssignmentsHistoryMutator {
  project_export_assignment_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  project_exports_id?: string;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}