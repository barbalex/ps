/** Represents the table partman.template_public_qc_assignments_history */
export default interface TemplatePublicQcAssignmentsHistory {
  qc_assignment_id: string;

  project_id: string | null;

  subproject_id: string | null;

  qc_id: string;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_qc_assignments_history */
export interface TemplatePublicQcAssignmentsHistoryInitializer {
  qc_assignment_id: string;

  project_id?: string | null;

  subproject_id?: string | null;

  qc_id: string;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_qc_assignments_history */
export interface TemplatePublicQcAssignmentsHistoryMutator {
  qc_assignment_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  qc_id?: string;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}